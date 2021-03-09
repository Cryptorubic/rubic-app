import { Injectable } from '@angular/core';
import Web3 from 'web3';
import ERC20_TOKEN_ABI from '../constants/erc-20-api';
import { UserRejectError } from '../../../errors/bridge/UserRejectError';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { MetamaskProviderService } from '../private-provider/metamask-provider/metamask-provider.service';
import { TransactionReceipt } from 'web3-eth';
import { BLOCKCHAIN_NAME, IBlockchain } from '../types/Blockchain';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Web3PrivateService {
  private web3: Web3;

  private defaultMockGas: string;


  public readonly onAddressChanges: Subject<string>;
  public readonly onNetworkChanges: Subject<IBlockchain>;

  public get address(): string {
    return this.provider.address;
  }

  public get network(): IBlockchain {
    return this.provider.network;
  }

  public get networkName(): BLOCKCHAIN_NAME {
    return this.provider.networkName;
  }

  public get isProviderActive(): boolean {
    return this.provider.isActive;
  }

  public get isProviderInstalled(): boolean {
    return this.provider.isInstalled;
  }

  public async activate(): Promise<void> {
    return this.provider.activate();
  }

  constructor(
    private readonly httpClient: HttpClient,
    private readonly provider: MetamaskProviderService
  ) {
    this.provider = provider;
    this.onAddressChanges = provider.onAddressChanges;
    this.onNetworkChanges = provider.onNetworkChanges;
    this.web3 = provider.web3;
    this.defaultMockGas = provider.defaultGasLimit;
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
    options: {
      onTransactionHash?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods
        .transfer(toAddress, amount.toString())
        .send({ from: this.address, ...(this.defaultMockGas && { gas: this.defaultMockGas }) })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', err => {
          console.log(`Tokens transfer error. ${err}`);
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
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods
        .transfer(toAddress, amount.toString())
        .send({ from: this.address, ...(this.defaultMockGas && { gas: this.defaultMockGas }) })
        .on('transactionHash', hash => resolve(hash))
        .on('error', err => {
          console.log(`Tokens transfer error. ${err}`);
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
   * @return transaction receipt
   */
  public async sendTransaction(
    toAddress: string,
    value: BigNumber | string,
    options: {
      onTransactionHash?: (hash: string) => void;
      inWei?: boolean;
    } = {}
  ): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
      this.web3.eth
        .sendTransaction({
          from: this.address,
          to: toAddress,
          value: options.inWei ? value.toString() : this.ethToWei(value),
          ...(this.defaultMockGas && { gas: this.defaultMockGas })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', receipt => resolve(receipt))
        .on('error', err => {
          console.log(`Tokens transfer error. ${err}`);
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
    options: {
      inWei?: boolean;
    } = {}
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
          console.log(`Tokens transfer error. ${err}`);
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
    value: BigNumber,
    options: {
      onTransactionHash?: (hash: string) => void;
    } = {}
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    return new Promise((resolve, reject) => {
      contract.methods
        .approve(spenderAddress, value.toFixed(0))
        .send({
          from: this.address,
          ...(this.defaultMockGas && { gas: this.defaultMockGas })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', err => {
          console.log(`Tokens approve error. ${err}`);
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
    contractAbi: any[],
    methodName: string,
    methodArguments: any[],
    options: {
      onTransactionHash?: (hash: string) => void;
      value?: BigNumber | string;
    } = {}
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods[methodName](...methodArguments)
        .send({
          from: this.address,
          ...(options.value && { value: options.value }),
          ...(this.defaultMockGas && { gas: this.defaultMockGas })
        })
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', err => {
          console.log(`Method execution error. ${err}`);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description executes method of smart-contract and resolve the promise
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName executing method name
   * @param methodArguments executing method arguments
   * @param blockchain platform of the contract address
   * @return smart-contract method returned value
   */
  public async callContractMethod(
    contractAddress: string,
    contractAbi: any[],
    methodName: string,
    methodArguments: any[],
    blockchain: BLOCKCHAIN_NAMES = BLOCKCHAIN_NAMES.ETHEREUM
  ): Promise<any> {
    const contract = new this.web3Infura[blockchain].eth.Contract(contractAbi, contractAddress);

    return contract.methods[methodName](...methodArguments)
      .call({ from: this.address })
      .toPromise();
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
    contractAbi: any[],
    methodName: string,
    methodArguments: any[]
  ): Promise<any> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods[methodName](...methodArguments)
        .send({
          from: this.address,
          ...(this.defaultMockGas && { gas: this.defaultMockGas })
        })
        .on('transactionHash', resolve)
        .on('error', err => {
          console.log(`Tokens approve error. ${err}`);
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
