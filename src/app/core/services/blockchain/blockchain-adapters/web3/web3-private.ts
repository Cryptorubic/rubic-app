import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { AbiItem } from 'web3-utils';
import TransactionRevertedError from 'src/app/core/errors/models/common/transaction-reverted.error';
import { minGasPriceInBlockchain } from 'src/app/core/services/blockchain/constants/minGasPriceInBlockchain';
import CustomError from 'src/app/core/errors/models/custom-error';
import FailedToCheckForTransactionReceiptError from 'src/app/core/errors/models/common/FailedToCheckForTransactionReceiptError';
import ERC20_TOKEN_ABI from 'src/app/core/services/blockchain/constants/erc-20-abi';
import { UserRejectError } from 'src/app/core/errors/models/provider/UserRejectError';
import { LowGasError } from 'src/app/core/errors/models/provider/LowGasError';
import { Observable } from 'rxjs';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';

type Web3Error = {
  message: string;
  code: number;
};

export class Web3Private {
  private defaultMockGas: string;

  private address: string;

  private network: IBlockchain;

  constructor(
    private readonly web3: Web3,
    private readonly address$: Observable<string>,
    private readonly network$: Observable<IBlockchain>
  ) {
    this.address$.subscribe(address => (this.address = address));
    this.network$.subscribe(network => (this.network = network));
  }

  private static parseError(err: Web3Error): Error {
    if (err.message.includes('Transaction has been reverted by the EVM')) {
      return new TransactionRevertedError();
    }
    if (err.message.includes('Failed to check for transaction receipt')) {
      return new FailedToCheckForTransactionReceiptError();
    }
    if (err.code === -32603) {
      return new LowGasError();
    }
    if (err.code === 4001) {
      return new UserRejectError();
    }
    try {
      const errorMessage = JSON.parse(err.message.slice(24)).message;
      if (errorMessage) {
        return new CustomError(errorMessage);
      }
    } catch (_ignored) {}
    return err as unknown as Error;
  }

  private calculateGasPrice(gasPrice?: string): string | undefined {
    const minGasPrice =
      minGasPriceInBlockchain[this.network.name as keyof typeof minGasPriceInBlockchain];
    if (!minGasPrice) {
      return gasPrice;
    }
    if (!gasPrice) {
      // TODO: gas во всем Web3Private требует рефакторинга
      return minGasPrice.toFixed();
    }
    return BigNumber.max(gasPrice, minGasPrice).toFixed();
  }

  /**
   * sends ERC-20 tokens and resolve the promise when the transaction is included in the block
   * @param contractAddress address of the smart-contract corresponding to the token
   * @param toAddress token receiver address
   * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
   * @param [options] additional options
   * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
   * @return transaction receipt
   */
  public async transferTokens(
    contractAddress: string,
    toAddress: string,
    amount: string | BigNumber,
    options: TransactionOptions = {}
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], contractAddress);
    const gasPrice = this.calculateGasPrice(options.gasPrice || this.defaultMockGas);

    return new Promise((resolve, reject) => {
      contract.methods
        .transfer(toAddress, amount.toString())
        .send({
          from: this.address,
          ...((options.gas || this.defaultMockGas) && {
            gas: options.gas || this.defaultMockGas
          }),
          ...(gasPrice && { gasPrice })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', (err: Web3Error) => {
          console.error(`Tokens transfer error. ${err}`);
          reject(Web3Private.parseError(err));
        });
    });
  }

  /**
   * sends ERC-20 tokens and resolve the promise without waiting for the transaction to be included in the block
   * @param contractAddress address of the smart-contract corresponding to the token
   * @param toAddress token receiver address
   * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
   * @return transaction hash
   */
  public async transferTokensWithOnHashResolve(
    contractAddress: string,
    toAddress: string,
    amount: string | BigNumber
  ): Promise<string> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods
        .transfer(toAddress, amount.toString())
        .send({ from: this.address, ...(this.defaultMockGas && { gas: this.defaultMockGas }) })
        .on('transactionHash', (hash: string) => resolve(hash))
        .on('error', (err: Web3Error) => {
          console.error(`Tokens transfer error. ${err}`);
          reject(Web3Private.parseError(err));
        });
    });
  }

  /**
   * tries to send Eth in transaction and resolve the promise when the transaction is included in the block or rejects the error
   * @param toAddress Eth receiver address
   * @param value amount in Eth units
   * @param [options] additional options
   * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
   * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
   * @param [options.data] data for calling smart contract methods.
   *    Use this field only if you are receiving data from a third-party api.
   *    When manually calling contract methods, use executeContractMethod()
   * @param [options.gas] transaction gas limit in absolute gas units
   * @param [options.gasPrice] price of gas unit in wei
   * @return transaction receipt
   */
  public async trySendTransaction(
    toAddress: string,
    value: BigNumber | string,
    options: TransactionOptions = {}
  ): Promise<TransactionReceipt> {
    try {
      await this.web3.eth.call({
        from: this.address,
        to: toAddress,
        value: options.inWei ? value.toString() : this.ethToWei(value),
        ...((options.gas || this.defaultMockGas) && {
          gas: options.gas || this.defaultMockGas
        }),
        ...(options.data && { data: options.data })
        // ...(options.gasPrice && { gasPrice: options.gasPrice }) doesn't work on mobile
      });
      return this.sendTransaction(toAddress, value, options);
    } catch (err) {
      console.error('Send transaction error', err);
      throw Web3Private.parseError(err);
    }
  }

  /**
   * sends Eth in transaction and resolve the promise when the transaction is included in the block
   * @param toAddress Eth receiver address
   * @param value amount in Eth units
   * @param [options] additional options
   * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
   * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
   * @param [options.data] data for calling smart contract methods.
   *    Use this field only if you are receiving data from a third-party api.
   *    When manually calling contract methods, use executeContractMethod()
   * @param [options.gas] transaction gas limit in absolute gas units
   * @param [options.gasPrice] price of gas unit in wei
   * @return transaction receipt
   */
  public async sendTransaction(
    toAddress: string,
    value: BigNumber | string,
    options: TransactionOptions = {}
  ): Promise<TransactionReceipt> {
    const gasPrice = this.calculateGasPrice(options.gasPrice || this.defaultMockGas);

    return new Promise((resolve, reject) => {
      this.web3.eth
        .sendTransaction({
          from: this.address,
          to: toAddress,
          value: options.inWei ? value.toString() : this.ethToWei(value),
          ...((options.gas || this.defaultMockGas) && {
            gas: options.gas || this.defaultMockGas
          }),
          ...(options.data && { data: options.data }),
          ...(gasPrice && { gasPrice })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', receipt => resolve(receipt))
        .on('error', err => {
          console.error('Send transaction error', err);
          reject(Web3Private.parseError(err as unknown as Web3Error));
        });
    });
  }

  /**
   * sends Eth in transaction and resolve the promise without waiting for the transaction to be included in the block
   * @param toAddress Eth receiver address
   * @param value amount in Eth units
   * @param [options] additional options
   * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
   * @return transaction hash
   */
  public async sendTransactionWithOnHashResolve(
    toAddress: string,
    value: string | BigNumber,
    options: TransactionOptions = {}
  ): Promise<string> {
    const gasPrice = this.calculateGasPrice(options.gasPrice || this.defaultMockGas);

    return new Promise((resolve, reject) => {
      this.web3.eth
        .sendTransaction({
          from: this.address,
          to: toAddress,
          value: options.inWei ? value.toString() : this.ethToWei(value),
          ...(gasPrice && { gasPrice })
        })
        .on('transactionHash', hash => resolve(hash))
        .on('error', err => {
          console.error(`Tokens transfer error. ${err}`);
          reject(Web3Private.parseError(err as unknown as Web3Error));
        });
    });
  }

  /**
   * executes approve method in ERC-20 token contract
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param spenderAddress wallet or contract address to approve
   * @param value integer value to approve (pre-multiplied by 10 ** decimals)
   * @param [options] additional options
   * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
   * @return approval transaction receipt
   */
  public async approveTokens(
    tokenAddress: string,
    spenderAddress: string,
    value: BigNumber | 'infinity',
    options: TransactionOptions = {}
  ): Promise<TransactionReceipt> {
    let rawValue: BigNumber;
    if (value === 'infinity') {
      rawValue = new BigNumber(2).pow(256).minus(1);
    } else {
      rawValue = value;
    }
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], tokenAddress);
    const gasPrice = this.calculateGasPrice(options.gasPrice || this.defaultMockGas);

    return new Promise((resolve, reject) => {
      contract.methods
        .approve(spenderAddress, rawValue.toFixed(0))
        .send({
          from: this.address,
          ...((options.gas || this.defaultMockGas) && {
            gas: options.gas || this.defaultMockGas
          }),
          ...(gasPrice && { gasPrice })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', (err: Web3Error) => {
          console.error(`Tokens approve error. ${err}`);
          reject(Web3Private.parseError(err));
        });
    });
  }

  /**
   * tries to execute method of smart-contract and resolve the promise when the transaction is included in the block or rejects the error
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName executing method name
   * @param methodArguments executing method arguments
   * @param [options] additional options
   * @param [options.value] amount in Wei amount to be attached to the transaction
   * @param [options.gas] gas limit to be attached to the transaction
   * @param allowError Check error and decides to execute contact if it needed.
   */
  public async tryExecuteContractMethod(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[],
    options: TransactionOptions = {},
    allowError?: (err: Web3Error) => boolean
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    try {
      await contract.methods[methodName](...methodArguments).call({
        from: this.address,
        ...(options.value && { value: options.value }),
        ...((options.gas || this.defaultMockGas) && {
          gas: options.gas || this.defaultMockGas
        })
        // ...(options.gasPrice && { gasPrice: options.gasPrice }) doesn't work on mobile
      });
      return this.executeContractMethod(
        contractAddress,
        contractAbi,
        methodName,
        methodArguments,
        options
      );
    } catch (err) {
      if (allowError?.(err)) {
        return this.executeContractMethod(
          contractAddress,
          contractAbi,
          methodName,
          methodArguments,
          options
        );
      }
      console.error('Method execution error: ', err);
      throw Web3Private.parseError(err);
    }
  }

  /**
   * executes method of smart-contract and resolve the promise when the transaction is included in the block
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName executing method name
   * @param methodArguments executing method arguments
   * @param [options] additional options
   * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
   * @param [options.value] amount in Wei amount to be attached to the transaction
   * @return smart-contract method returned value
   */
  public async executeContractMethod(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[],
    options: TransactionOptions = {}
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    const gasPrice = this.calculateGasPrice(options.gasPrice || this.defaultMockGas);

    return new Promise((resolve, reject) => {
      contract.methods[methodName](...methodArguments)
        .send({
          from: this.address,
          ...(options.value && { value: options.value }),
          ...((options.gas || this.defaultMockGas) && {
            gas: options.gas || this.defaultMockGas
          }),
          ...(gasPrice && { gasPrice })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', (err: Web3Error) => {
          console.error(`Method execution error. ${err}`);
          reject(Web3Private.parseError(err));
        });
    });
  }

  /**
   * executes method of smart-contract and resolve the promise without waiting for the transaction to be included in the block
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName executing method name
   * @param methodArguments executing method arguments
   * @return smart-contract method returned value
   */
  public executeContractMethodWithOnHashResolve(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[]
  ): Promise<unknown> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods[methodName](...methodArguments)
        .send({
          from: this.address,
          ...(this.defaultMockGas && { gas: this.defaultMockGas })
        })
        .on('transactionHash', resolve)
        .on('error', (err: Web3Error) => {
          console.error(`Tokens approve error. ${err}`);
          reject(Web3Private.parseError(err));
        });
    });
  }

  /**
   * removes approval for token use
   * @param tokenAddress tokenAddress address of the smart-contract corresponding to the token
   * @param spenderAddress wallet or contract address to approve
   */
  public async unApprove(
    tokenAddress: string,
    spenderAddress: string
  ): Promise<TransactionReceipt> {
    return this.approveTokens(tokenAddress, spenderAddress, new BigNumber(0));
  }

  /**
   * Converts Eth amount into Wei.
   * @param value to convert in Eth
   */
  private ethToWei(value: string | BigNumber): string {
    return this.web3.utils.toWei(value.toString(), 'ether');
  }

  /**
   * Converts Wei amount into Eth.
   * @param value to convert in Wei
   */
  private weiToEth(value: string | BigNumber): string {
    return this.web3.utils.fromWei(value.toString(), 'ether');
  }
}
