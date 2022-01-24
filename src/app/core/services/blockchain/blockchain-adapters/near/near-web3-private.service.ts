import { Inject, Injectable } from '@angular/core';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { ConnectedWalletAccount, Connection, utils, WalletConnection } from 'near-api-js';
import {
  AddKey,
  CreateAccount,
  createTransaction,
  DeleteAccount,
  DeleteKey,
  DeployContract,
  FunctionCall,
  functionCall,
  Stake,
  Transaction,
  Transfer
} from 'near-api-js/lib/transaction';
import { Enum } from 'near-api-js/lib/utils/enums';
import { AccessKeyInfoView, AccessKeyList } from 'near-api-js/lib/providers/provider';
import { PublicKey } from 'near-api-js/lib/utils';
import { baseDecode, serialize } from 'borsh';
import { NearTransaction } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { SWAP_SCHEMA } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/constants/ref-fi-constants';
import * as BN from 'bn.js';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { NEAR_MAINNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';

interface TransactionParams {
  receiverId: string;
  actions: Action[];
  nonceOffset?: number;
}

class Action extends Enum {
  createAccount: CreateAccount;

  deployContract: DeployContract;

  functionCall: FunctionCall;

  transfer: Transfer;

  stake: Stake;

  addKey: AddKey;

  deleteKey: DeleteKey;

  deleteAccount: DeleteAccount;
}

@Injectable({
  providedIn: 'root'
})
export class NearWeb3PrivateService {
  private readonly multisigHasMethod: string = 'add_request_and_confirm';

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

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
      throw new Error(`Cannot find matching key for transaction sent to ${receiverId}`);
    }

    const block = await connection.provider.block({ finality: 'final' });
    const blockHash = baseDecode(block.header.hash);
    const publicKey = PublicKey.from(accessKey.public_key);
    const nonce = accessKey.access_key.nonce + nonceOffset;

    return createTransaction(wallet.accountId, publicKey, receiverId, nonce, actions, blockHash);
  }

  public async executeMultipleTransactions(
    transactions: NearTransaction[],
    type: SWAP_PROVIDER_TYPE,
    toAmount: string
  ): Promise<void> {
    const wallet = new WalletConnection(
      this.walletConnectorService.nearConnection,
      'rubic'
    ).account();

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
                NearWeb3PrivateService.getGas(fc.gas),
                NearWeb3PrivateService.getAmount(fc.amount)
              )
            )
          },
          wallet
        );
      })
    );

    await this.requestSignTransactions(nearTransactions, type, toAmount);
  }

  private static getGas(gas: string): BN {
    return new BN(gas || '100000000000000');
  }

  private static getAmount(amount: string): BN {
    return new BN(amount ? utils.format.parseNearAmount(amount) : '0');
  }

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

    const account = new WalletConnection(this.walletConnectorService.nearConnection, 'rubic');

    const walletKeys = await account._authData.allKeys;
    for (const accessKey of accessKeys) {
      if (
        walletKeys.indexOf(accessKey.public_key) !== -1 &&
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
      /********************************
       Accept multisig access keys and let wallets attempt to signAndSendTransaction
       If an access key has itself as receiverId and method permission add_request_and_confirm, then it is being used in a wallet with multisig contract: https://github.com/near/core-contracts/blob/671c05f09abecabe7a7e58efe942550a35fc3292/multisig/src/lib.rs#L149-L153
       ********************************/
      if (allowedReceiverId === accountId && allowedMethods.includes(this.multisigHasMethod)) {
        return true;
      }
      if (allowedReceiverId === receiverId) {
        if (actions.length !== 1) {
          return false;
        }
        const [{ functionCall: fnCall }] = actions;
        return (
          fnCall &&
          (!fnCall.deposit || fnCall.deposit.toString() === '0') && // TODO: Should support charging amount smaller than allowance?
          (allowedMethods.length === 0 || allowedMethods.includes(fnCall.methodName))
        );
        // TODO: Handle cases when allowance doesn't have enough to pay for gas
      }
    }
    // TODO: Support other permissions than FunctionCall

    return false;
  }

  public async requestSignTransactions(
    transactions: Transaction[],
    type: SWAP_PROVIDER_TYPE,
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
