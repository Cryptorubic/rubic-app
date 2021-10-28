import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import BigNumber from 'bignumber.js';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { Web3Private } from 'src/app/core/services/blockchain/providers/private-provider/common/web3-private';

export abstract class EthereumWalletProvider {
  /**
   * Is the blockchain provider installed.
   */
  abstract get isInstalled(): boolean;

  /**
   * Is the blockchain provider activated.
   */
  abstract get isActive(): boolean;

  /**
   * Is connected app provider supports multi chain wallet.
   */
  abstract get isMultiChainWallet(): boolean;

  /**
   * Gets current provider name.
   */
  abstract get name(): WALLET_NAME;

  /**
   * Gets current selected wallet address.
   * @return current Selected wallet address or undefined if isActive is false.
   */
  get address(): string {
    if (!this.isActive) {
      return null;
    }
    return this.getAddress();
  }

  /**
   * Gets current selected network.
   * @return current Selected network or undefined if isActive is false.
   */
  get network(): IBlockchain {
    if (!this.isActive) {
      return null;
    }
    return this.getNetwork();
  }

  /**
   * Default value for transactions gasLimit. Required for tests provider stub.
   */
  public readonly defaultGasLimit: string | undefined = undefined;

  /**
   * Errors service.
   */
  public errorsService: ErrorsService;

  /**
   * Gets wallet address.
   */
  public abstract getAddress(): string;

  /**
   * Gets wallet network.
   */
  public abstract getNetwork(): IBlockchain;

  protected constructor(errorsService: ErrorsService, private readonly web3Private: Web3Private) {
    this.errorsService = errorsService;
  }

  /**
   * Calculates an Ethereum specific signature.
   * @param message Data to sign.
   * @return Promise<string> The signature.
   */
  public abstract signPersonal(message: string): Promise<string>;

  /**
   * Gets current selected network name.
   * @return current Selected network name or undefined if isActive is false.
   */
  get networkName(): BLOCKCHAIN_NAME {
    return this.network?.name;
  }

  /**
   * Activates the blockchain provider.
   */
  public abstract activate(): Promise<void>;

  /**
   * Deactivate the blockchain provider.
   */
  public abstract deActivate(): void;

  /**
   * Opens a window with suggestion to add token to user's wallet.
   * @param token Token to add.
   */
  public abstract addToken(token: Token): Promise<void>;

  /**
   * Requests permissions from wallet.
   */
  public async requestPermissions(): Promise<{ parentCapability: string }[]> {
    return [{ parentCapability: 'eth_accounts' }];
  }

  /**
   * Switches chain in wallet.
   * @param chainParams Chain ID to switch for.
   */
  public abstract switchChain(chainParams: string): Promise<null | never>;

  /**
   * Adds chain to the wallet.
   * @param params Add chain params.
   */
  public abstract addChain(params: AddEthChainParams): Promise<null | never>;

  transferTokens(
    contractAddress: string,
    toAddress: string,
    amount: string | BigNumber,
    options: TransactionOptions
  ): Promise<TransactionReceipt> {
    return this.web3Private.transferTokens(contractAddress, toAddress, amount, options);
  }

  transferTokensWithOnHashResolve(
    contractAddress: string,
    toAddress: string,
    amount: string | BigNumber
  ): Promise<string> {
    return this.web3Private.transferTokensWithOnHashResolve(contractAddress, toAddress, amount);
  }

  trySendTransaction(
    toAddress: string,
    value: BigNumber | string,
    options: TransactionOptions
  ): Promise<TransactionReceipt> {
    return this.web3Private.trySendTransaction(toAddress, value, options);
  }

  sendTransaction(
    toAddress: string,
    value: BigNumber | string,
    options: TransactionOptions
  ): Promise<TransactionReceipt> {
    return this.web3Private.sendTransaction(toAddress, value, options);
  }

  sendTransactionWithOnHashResolve(
    toAddress: string,
    value: string | BigNumber,
    options: TransactionOptions
  ): Promise<string> {
    return this.web3Private.sendTransactionWithOnHashResolve(toAddress, value, options);
  }

  approveTokens(
    tokenAddress: string,
    spenderAddress: string,
    value: BigNumber | 'infinity',
    options: TransactionOptions
  ): Promise<TransactionReceipt> {
    return this.web3Private.approveTokens(tokenAddress, spenderAddress, value, options);
  }

  tryExecuteContractMethod(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[],
    options: TransactionOptions,
    allowError?: (err: unknown) => boolean
  ): Promise<TransactionReceipt> {
    return this.web3Private.tryExecuteContractMethod(
      contractAddress,
      contractAbi,
      methodName,
      methodArguments,
      options,
      allowError
    );
  }

  executeContractMethod(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[],
    options: TransactionOptions
  ): Promise<TransactionReceipt> {
    return this.web3Private.executeContractMethod(
      contractAddress,
      contractAbi,
      methodName,
      methodArguments,
      options
    );
  }

  executeContractMethodWithOnHashResolve(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[]
  ): Promise<unknown> {
    return this.web3Private.executeContractMethodWithOnHashResolve(
      contractAddress,
      contractAbi,
      methodName,
      methodArguments
    );
  }

  unApprove(tokenAddress: string, spenderAddress: string): Promise<TransactionReceipt> {
    return this.web3Private.unApprove(tokenAddress, spenderAddress);
  }
}
