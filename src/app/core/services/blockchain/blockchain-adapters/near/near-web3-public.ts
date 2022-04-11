import BigNumber from 'bignumber.js';

import { Near } from 'near-api-js/lib/near';
import { ConnectConfig } from 'near-api-js/lib/connect';
import { connect } from 'near-api-js/lib/browser-connect';
import { WalletConnection } from 'near-api-js';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/common/web3-public';
import { BlockchainTokenExtended } from '@shared/models/tokens/blockchain-token-extended';
import { NATIVE_NEAR_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { EthLikeWeb3Pure } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-pure/eth-like-web3-pure';

export class NearWeb3Public extends Web3Public<null, FinalExecutionOutcome> {
  public static addressToBytes32(address: string): string {
    return EthLikeWeb3Pure.asciiToBytes32(address);
  }

  public readonly nativeTokenAddress = NATIVE_NEAR_ADDRESS;

  /**
   * Connection with Near wallet.
   */
  private _walletConnection: WalletConnection;

  public get walletConnection(): WalletConnection {
    return this._walletConnection;
  }

  /**
   * RPC connection to near blockchain.
   * @private
   */
  private _connection: Near;

  public get connection(): Near {
    return this._connection;
  }

  constructor(config: ConnectConfig, private handleConnection: (connection: Near) => void) {
    super();
    this.establishConnection(config);
  }

  /**
   * Establish connection with Near blockchain&
   * @param config Near connection config.
   */
  private async establishConnection(config: ConnectConfig): Promise<void> {
    this._connection = await connect(config);
    this._walletConnection = new WalletConnection(this._connection, 'my-app');
    this.handleConnection(this._connection);
  }

  /**
   * Gets allowance.
   */
  public async getAllowance(): Promise<BigNumber> {
    return new BigNumber(Infinity);
  }

  /**
   * Checks if a given address is a valid Near address.
   * @param address The address to check validity.
   */
  public isAddressCorrect(address: string): boolean {
    const regex = new RegExp('^(([a-z\\d]+[\\-_])*[a-z\\d]+\\.)*([a-z\\d]+[\\-_])*[a-z\\d]+$');
    return regex.test(address) && address?.length > 2 && address?.length <= 64;
  }

  /**
   * Gets information about token from blockchain.
   */
  public async getTokenInfo(): Promise<BlockchainTokenExtended> {
    return null;
  }

  /**
   * Gets native or alternative token balance.
   * @param userAddress Wallet address whose balance you want to find out.
   * @param tokenAddress Address of the smart-contract corresponding to the token.
   */
  public async getTokenOrNativeBalance(
    userAddress: string,
    tokenAddress: string
  ): Promise<BigNumber> {
    return this.getTokenBalance(userAddress, tokenAddress);
  }

  /**
   * Gets token balance.
   * @param tokenAddress Address of the token in Near.
   * @param address User wallet address whose balance you want to find out.
   * @return Promise<BigNumber> Tokens balance.
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber> {
    if (tokenAddress === NATIVE_NEAR_ADDRESS) {
      const balance = await this._walletConnection.account().getAccountBalance();
      const availableBalance = new BigNumber(balance?.available).minus('0.05');
      return availableBalance.gt(0) ? availableBalance : new BigNumber(0);
    }
    const tokenBalance = await this._walletConnection
      .account()
      .viewFunction(tokenAddress, 'ft_balance_of', {
        account_id: address
      });
    return new BigNumber(tokenBalance);
  }

  /**
   * Returns the most recent block's gas price.
   */
  public async getEstimatedGas(): Promise<BigNumber> {
    const gas = await this._connection.connection.provider.gasPrice(null);
    return new BigNumber(gas.gas_price);
  }

  /**
   * Gets a transaction by hash in several attempts.
   * @param hash Hash of the target transaction.
   * @param attempt Current attempt number.
   * @param attemptsLimit Maximum allowed number of attempts.
   * @param delay Ms delay before next attempt.
   */
  public async getTransactionByHash(
    hash: string,
    attempt?: number,
    attemptsLimit?: number,
    delay?: number
  ): Promise<FinalExecutionOutcome> {
    attempt = attempt || 0;
    const limit = attemptsLimit || 10;
    const timeoutMs = delay || 500;

    if (attempt >= limit) {
      return null;
    }

    const transaction = await this._connection.connection.provider.txStatus(
      hash,
      this._walletConnection.getAccountId()
    );
    if (transaction === null) {
      return new Promise(resolve =>
        setTimeout(() => resolve(this.getTransactionByHash(hash, attempt + 1)), timeoutMs)
      );
    }
    return transaction;
  }

  /**
   * Gets balances of multiple tokens.
   * @TODO Near. Reduce amount of calls. Waiting for lib release:
   * https://github.com/QuicSwap/near-multicall
   * @param address wallet address
   * @param tokensAddresses tokens addresses
   */
  public async getTokensBalances(address: string, tokensAddresses: string[]): Promise<BigNumber[]> {
    const tokensBalances = await Promise.all(
      tokensAddresses.map(id => this.getTokenBalance(address, id))
    );
    return tokensBalances.map(balance => new BigNumber(balance));
  }
}
