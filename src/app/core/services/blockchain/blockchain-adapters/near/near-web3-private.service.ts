import { Inject, Injectable } from '@angular/core';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { ConnectedWalletAccount, Connection, utils, WalletConnection } from 'near-api-js';
import { createTransaction, functionCall, Transaction } from 'near-api-js/lib/transaction';
import { AccessKeyInfoView, AccessKeyList } from 'near-api-js/lib/providers/provider';
import { PublicKey } from 'near-api-js/lib/utils';
import { baseDecode, serialize } from 'borsh';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import * as BN from 'bn.js';
import { NEAR_MAINNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';
import { NearTransaction } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/near-transaction';
import { SWAP_SCHEMA } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/constants/ref-finance-swap-schema';
import { Action } from '@core/services/blockchain/blockchain-adapters/near/models/near-action';
import CustomError from '@core/errors/models/custom-error';
import { Near } from 'near-api-js/lib/near';
import { NearTransactionType } from '@core/services/blockchain/blockchain-adapters/near/models/near-transaction-type';

interface TransactionParams {
  receiverId: string;
  actions: Action[];
  nonceOffset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NearWeb3PrivateService {
  private get nearConnection(): Near {
    return this.walletConnectorService.nearConnection;
  }

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  /**
   * Creates transaction object.
   * @param transactionParams Transaction params
   * @param wallet Connected wallet account.
   */
  public async createTransaction(
    transactionParams: TransactionParams,
    wallet: ConnectedWalletAccount
  ): Promise<Transaction> {
    const { receiverId, actions, nonceOffset = 1 } = transactionParams;
    const connection = wallet.connection;
    const localKey = await connection.signer.getPublicKey(
      wallet.accountId,
      wallet.connection.networkId
    );
    const accessKey = await this.accessKeyForTransaction(receiverId, actions, wallet, localKey);
    if (!accessKey) {
      throw new CustomError(`Cannot find matching key for transaction sent to ${receiverId}`);
    }

    const block = await connection.provider.block({ finality: 'final' });
    const blockHash = baseDecode(block.header.hash);
    const publicKey = PublicKey.from(accessKey.public_key);
    const nonce = accessKey.access_key.nonce + nonceOffset;

    return createTransaction(wallet.accountId, publicKey, receiverId, nonce, actions, blockHash);
  }

  /**
   * Executes multiple transaction per one signature.
   * @param transactions Transactions to sign.
   * @param type Swap transaction type.
   * @param toAmount Amount of received tokens.
   */
  public async executeMultipleTransactions(
    transactions: NearTransaction[],
    type: NearTransactionType,
    toAmount: string
  ): Promise<void> {
    const wallet = new WalletConnection(this.nearConnection, 'rubic').account();

    const nearTransactions = await Promise.all(
      transactions.map((t, i) => {
        return this.createTransaction(
          {
            receiverId: t.receiverId,
            nonceOffset: i + 1,
            actions: t.functionCalls.map(fc =>
              functionCall(
                fc.methodName,
                fc.args,
                new BN(fc.gas || '100000000000000'),
                new BN(fc.amount ? utils.format.parseNearAmount(fc.amount) : '0')
              )
            )
          },
          wallet
        );
      })
    );

    await this.requestSignTransactions(nearTransactions, type, toAmount);
  }

  /**
   * Gets access keys for account.
   * @param connection Established blockchain connection.
   * @param accountId Account identifier.
   */
  private static async getAccessKeys(
    connection: Connection,
    accountId: string
  ): Promise<AccessKeyInfoView[]> {
    const response = await connection.provider.query<AccessKeyList>({
      request_type: 'view_access_key_list',
      account_id: accountId,
      finality: 'optimistic'
    });
    return response.keys;
  }

  /**
   * Gets access keys for transaction.
   * @param receiverId Receiver wallet identifier.
   * @param actions List of actions.
   * @param wallet Wallet connection.
   * @param localKey Auth key to store in local storage.
   * @private
   */
  private async accessKeyForTransaction(
    receiverId: string,
    actions: Action[],
    wallet: ConnectedWalletAccount,
    localKey?: PublicKey
  ): Promise<AccessKeyInfoView | null> {
    const accessKeys = await NearWeb3PrivateService.getAccessKeys(
      wallet.connection,
      wallet.accountId
    );

    if (localKey) {
      const accessKey = accessKeys.find(key => key.public_key.toString() === localKey.toString());
      if (
        accessKey &&
        (await this.accessKeyMatchesTransaction(accessKey, receiverId, actions, wallet.accountId))
      ) {
        return accessKey;
      }
    }

    const account = new WalletConnection(this.nearConnection, 'rubic');

    const walletKeys: unknown[] = await account._authData.allKeys;
    for (const accessKey of accessKeys) {
      if (
        walletKeys.some(key => key === accessKey.public_key) &&
        (await this.accessKeyMatchesTransaction(
          accessKey,
          receiverId,
          actions,
          account.account().accountId
        ))
      ) {
        return accessKey;
      }
    }

    return null;
  }

  /**
   * Checks if access key match transaction.
   * @param accessKey Access key.
   * @param receiverId Receiver wallet identifier.
   * @param actions List of actions.
   * @param accountId Account identifier.
   */
  private async accessKeyMatchesTransaction(
    accessKey: AccessKeyInfoView,
    receiverId: string,
    actions: Action[],
    accountId: string
  ): Promise<boolean> {
    const {
      access_key: { permission }
    } = accessKey;
    if (permission === 'FullAccess') {
      return true;
    }

    if (permission.FunctionCall) {
      const { receiver_id: allowedReceiverId, method_names: allowedMethods } =
        permission.FunctionCall;
      /**
       * Accept multisig access keys and let wallets attempt to signAndSendTransaction.
       * If an access key has itself as receiverId and method permission add_request_and_confirm,
       * then it is being used in a wallet with multisig contract:
       * https://github.com/near/core-contracts/blob/671c05f09abecabe7a7e58efe942550a35fc3292/multisig/src/lib.rs#L149-L153
       */
      const multiSigHasMethod = 'add_request_and_confirm';
      if (allowedReceiverId === accountId && allowedMethods.includes(multiSigHasMethod)) {
        return true;
      }
      if (allowedReceiverId === receiverId) {
        if (actions.length !== 1) {
          return false;
        }
        const [{ functionCall: fnCall }] = actions;
        return (
          fnCall &&
          (!fnCall.deposit || fnCall.deposit.toString() === '0') &&
          (allowedMethods.length === 0 || allowedMethods.includes(fnCall.methodName))
        );
      }
    }

    return false;
  }

  /**
   * Makes request to sign transactions list.
   * @param transactions List of transactions.
   * @param type Swap transaction type.
   * @param toAmount Amount of received tokens.
   */
  public async requestSignTransactions(
    transactions: Transaction[],
    type: NearTransactionType,
    toAmount: string
  ): Promise<void> {
    const currentUrl = new URL(this.window.location.href);
    currentUrl.searchParams.set('swap_type', type);
    currentUrl.searchParams.set('toAmount', toAmount);
    const walletAddress = this.walletConnectorService.address;
    currentUrl.searchParams.set('walletAddress', walletAddress);
    const newUrl = new URL('sign', NEAR_MAINNET_CONFIG.walletUrl);
    newUrl.searchParams.set(
      'transactions',
      transactions
        .map(transaction => serialize(SWAP_SCHEMA, transaction))
        .map(serialized => Buffer.from(serialized).toString('base64'))
        .join(',')
    );
    newUrl.searchParams.set('callbackUrl', currentUrl.toString());
    this.window.location.assign(newUrl);
    return;
  }
}
