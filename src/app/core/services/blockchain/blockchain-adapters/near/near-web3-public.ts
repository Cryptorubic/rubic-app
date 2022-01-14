import BigNumber from 'bignumber.js';

import { Account, Transaction, TransactionResponse } from '@solana/web3.js';
import { SolanaWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { Near } from 'near-api-js/lib/near';
import { ConnectConfig } from 'near-api-js/lib/connect';
import { connect } from 'near-api-js/lib/browser-connect';
import { WalletConnection } from 'near-api-js';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/common/web3-public';
import { BlockchainTokenExtended } from '@shared/models/tokens/blockchain-token-extended';
import {
  NATIVE_NEAR_ADDRESS,
  NATIVE_SOLANA_MINT_ADDRESS
} from '@shared/constants/blockchain/native-token-address';
import InsufficientFundsError from '@core/errors/models/instant-trade/insufficient-funds-error';
import { BIG_NUMBER_FORMAT } from '@shared/constants/formats/big-number-format';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

export class NearWeb3Public extends Web3Public<null, TransactionResponse> {
  private walletConnection: WalletConnection;

  private connection: Near;

  constructor(config: ConnectConfig, private handleConnection: (connection: Near) => void) {
    super();
    this.establishConnection(config);
  }

  private async establishConnection(config: ConnectConfig): Promise<void> {
    this.connection = await connect(config);
    this.walletConnection = new WalletConnection(this.connection, 'my-app');
    this.handleConnection(this.connection);
  }

  /**
   * Gets allowance.
   */
  public async getAllowance(): Promise<BigNumber> {
    return new BigNumber(Infinity);
  }

  // @TODO near.
  /**
   * Checks if a given address is a valid Solana address.
   * @param address The address to check validity.
   */
  public isAddressCorrect(address: string): boolean {
    console.log(address);
    return true;
    // try {
    //   return Boolean(new PublicKey(address)?.toBase58());
    // } catch {
    //   return false;
    // }
  }

  // @TODO near.
  /**
   * checks if address is Ether native address
   * @param address address to check
   */
  public isNativeAddress = (address: string): boolean => {
    return address === NATIVE_SOLANA_MINT_ADDRESS;
  };

  // @TODO near.
  public async getTokenInfo(): Promise<BlockchainTokenExtended> {
    return null;
  }

  /**
   *
   * @param userAddress wallet address whose balance you want to find out
   * @param tokenAddress address of the smart-contract corresponding to the token
   */
  public async getTokenOrNativeBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<BigNumber> {
    console.log(userAddress, tokenAddress);
    // return this.isNativeAddress(tokenAddress)
    //   ? new BigNumber(
    //       (
    //         await this.connection.getBalanceAndContext(new PublicKey(userAddress), 'confirmed')
    //       ).value.toString()
    //     )
    //   : (await this.getTokensBalances(userAddress, [tokenAddress]))?.[0];
    return null;
  }

  /**
   * gets ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param address wallet address whose balance you want to find out
   * @return account tokens balance as integer (multiplied to 10 ** decimals)
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
    // return this.wallet.account().viewFunction({
    //   methodName: ,
    //   args: { account_id: wallet.getAccountId(), token_id: tokenId }
    // })
    console.log(address, tokenAddress);
    // return wallet.account().viewFunction('priv', 'get_deposit', args);
    // return (await this.getTokensBalances(address, [tokenAddress]))?.[0];
    return null;
  }
  //
  // refFiViewFunction = ({ methodName, args }: RefFiViewFunctionOptions) => {
  //   return wallet.account().viewFunction('priv', methodName, args);
  // };

  /**
   * Predicts the volume of gas required to execute the contract method
   */
  public async getEstimatedGas(): Promise<BigNumber> {
    // const { feeCalculator } = await this.connection.getRecentBlockhash();
    // return new BigNumber(feeCalculator.lamportsPerSignature);
    return null;
  }

  /**
   * get a transaction by hash in several attempts
   * @param hash hash of the target transaction
   * @param attempt current attempt number
   * @param attemptsLimit maximum allowed number of attempts
   * @param delay ms delay before next attempt
   */
  public async getTransactionByHash(
    hash: string,
    attempt?: number,
    attemptsLimit?: number,
    delay?: number
  ): Promise<TransactionResponse> {
    console.log(hash, attempt, attemptsLimit, delay);
    // attempt = attempt || 0;
    // const limit = attemptsLimit || 10;
    // const timeoutMs = delay || 500;
    //
    // if (attempt >= limit) {
    //   return null;
    // }
    //
    // const transaction = await this.connection.getTransaction(hash);
    // if (transaction === null) {
    //   return new Promise(resolve =>
    //     setTimeout(() => resolve(this.getTransactionByHash(hash, attempt + 1)), timeoutMs)
    //   );
    // }
    // return transaction;
    return null;
  }

  /**
   * get balance of multiple tokens via multicall.
   * @TODO Reduce amount of calls.
   * @param address wallet address
   * @param tokensAddresses tokens addresses
   */
  public async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    const wallet = new WalletConnection(this.connection, address);
    const tokensBalances = await Promise.all(
      tokensAddresses.map(id =>
        id === NATIVE_NEAR_ADDRESS
          ? null
          : this.walletConnection
              .account()
              .viewFunction(id, 'ft_balance_of', { account_id: wallet.getAccountId() })
      )
    );

    const nativeNearBalance = await this.walletConnection.account().getAccountBalance();

    return tokensAddresses.map((tokenAddress, index) => {
      if (tokenAddress === NATIVE_NEAR_ADDRESS) {
        return new BigNumber(nativeNearBalance.available);
      }
      return new BigNumber(tokensBalances[index]);
    });
  }

  public async signTransaction(
    walletAdapter: CommonWalletAdapter<SolanaWallet>,
    transaction: Transaction,
    signers: Array<Account> = []
  ): Promise<Transaction> {
    console.log(walletAdapter, transaction, signers);
    return null;
    // transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
    // transaction.setSigners(new PublicKey(walletAdapter.address), ...signers.map(s => s.publicKey));
    // if (signers.length > 0) {
    //   transaction.partialSign(...signers);
    // }
    // return await walletAdapter.wallet.signTransaction(transaction);
  }

  /**
   * Checks if the specified address contains the required amount of these tokens.
   * Throws an InsufficientFundsError if the balance is insufficient
   * @param token token balance for which you need to check
   * @param amount required balance
   * @param userAddress the address where the required balance should be
   */
  public async checkBalance(
    token: { address: string; symbol: string; decimals: number },
    amount: BigNumber,
    userAddress: string
  ): Promise<void> {
    const balance = await this.getTokenBalance(userAddress, token.address);
    const amountAbsolute = Web3Pure.toWei(amount, token.decimals);

    if (balance.lt(amountAbsolute)) {
      const formattedTokensBalance = Web3Pure.fromWei(balance, token.decimals).toFormat(
        BIG_NUMBER_FORMAT
      );
      throw new InsufficientFundsError(
        token.symbol,
        formattedTokensBalance,
        amount.toFormat(BIG_NUMBER_FORMAT)
      );
    }
  }
}
