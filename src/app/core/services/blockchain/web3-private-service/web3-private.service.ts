import { Injectable } from '@angular/core';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { AbiItem } from 'web3-utils';
import TransactionRevertedError from 'src/app/core/errors/models/common/transaction-reverted.error';
import ERC20_TOKEN_ABI from '../constants/erc-20-abi';
import { UserRejectError } from '../../../errors/models/provider/UserRejectError';
import { ProviderConnectorService } from '../provider-connector/provider-connector.service';
import { LowGasError } from '../../../errors/models/provider/LowGasError';

@Injectable({
  providedIn: 'root'
})
export class Web3PrivateService {
  private defaultMockGas: string;

  private readonly web3: Web3;

  private get address(): string {
    return this.providerConnector.address;
  }

  constructor(private readonly providerConnector: ProviderConnectorService) {
    this.web3 = providerConnector.web3;
    this.defaultMockGas = '400000';
  }

  /**
   * @description sends ERC-20 tokens and resolve the promise when the transaction is included in the block
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

    return new Promise((resolve, reject) => {
      contract.methods
        .transfer(toAddress, amount.toString())
        .send({
          from: this.address,
          ...((options.gas || this.defaultMockGas) && { gas: options.gas || this.defaultMockGas })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', err => {
          console.error(`Tokens transfer error. ${err}`);
          if (err.code === -32603) {
            reject(new LowGasError());
          }
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description sends ERC-20 tokens and resolve the promise without waiting for the transaction to be included in the block
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
        .on('transactionHash', hash => resolve(hash))
        .on('error', err => {
          console.error(`Tokens transfer error. ${err}`);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description sends Eth in transaction and resolve the promise when the transaction is included in the block
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
          ...(options.gasPrice && { gasPrice: options.gasPrice })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', receipt => resolve(receipt))
        .on('error', err => {
          console.error(`Tokens transfer error. ${err}`);
          // @ts-ignore
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description sends Eth in transaction and resolve the promise without waiting for the transaction to be included in the block
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
    return new Promise((resolve, reject) => {
      this.web3.eth
        .sendTransaction({
          from: this.address,
          to: toAddress,
          value: options.inWei ? value.toString() : this.ethToWei(value),
          ...(this.defaultMockGas && { gas: this.defaultMockGas })
        })
        .on('transactionHash', hash => resolve(hash))
        .on('error', err => {
          console.error(`Tokens transfer error. ${err}`);
          // @ts-ignore
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description executes approve method in ERC-20 token contract
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

    return new Promise((resolve, reject) => {
      contract.methods
        .approve(spenderAddress, rawValue.toFixed(0))
        .send({
          from: this.address,
          ...(this.defaultMockGas && { gas: this.defaultMockGas })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', err => {
          console.error(`Tokens approve error. ${err}`);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description executes method of smart-contract and resolve the promise when the transaction is included in the block
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

    return new Promise((resolve, reject) => {
      contract.methods[methodName](...methodArguments)
        .send({
          from: this.address,
          ...(options.value && { value: options.value }),
          ...((options.gas || this.defaultMockGas) && { gas: options.gas || this.defaultMockGas })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', err => {
          console.error(`Method execution error. ${err}`);
          if (err.message.includes('Transaction has been reverted by the EVM')) {
            reject(new TransactionRevertedError());
          }
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description executes method of smart-contract and resolve the promise without waiting for the transaction to be included in the block
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
        .on('error', err => {
          console.error(`Tokens approve error. ${err}`);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description removes approval for token use
   * @param tokenAddress tokenAddress address of the smart-contract corresponding to the token
   * @param spenderAddress wallet or contract address to approve
   */
  public async unApprove(tokenAddress, spenderAddress): Promise<TransactionReceipt> {
    return this.approveTokens(tokenAddress, spenderAddress, new BigNumber(0));
  }

  /**
   * @description converts Eth amount into Wei
   * @param value to convert in Eth
   */
  private ethToWei(value: string | BigNumber): string {
    return this.web3.utils.toWei(value.toString(), 'ether');
  }

  /**
   * @description converts Wei amount into Eth
   * @param value to convert in Wei
   */
  private weiToEth(value: string | BigNumber): string {
    return this.web3.utils.fromWei(value.toString(), 'ether');
  }
}
