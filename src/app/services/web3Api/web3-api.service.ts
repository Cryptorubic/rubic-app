import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { BridgeNetwork } from '../bridge/types';
import { ERC20_TOKEN_ABI } from '../web3/web3.constants';
import { RubicError } from '../../errors/RubicError';
import { UserRejectError } from '../../errors/bridge/UserRejectError';
import BigNumber from 'bignumber.js';
import { HttpClient } from '@angular/common/http';
import { ProviderService } from '../provider/provider.service';
import { TransactionReceipt } from 'web3-eth';
import { Transaction } from 'web3-core';

interface Web3ApiNetwork {
  id: number;
  name: string;
}

const NETWORKS: Web3ApiNetwork[] = [
  {
    id: 1,
    name: BridgeNetwork.ETHEREUM
  },
  {
    id: 56,
    name: BridgeNetwork.BINANCE_SMART_CHAIN
  },
  {
    id: 42, // kovan testnet
    name: BridgeNetwork.ETHEREUM_TESTNET
  }
];

@Injectable({
  providedIn: 'root'
})
export class Web3ApiService {
  private readonly metamaskAddress: string;
  private ethereum;
  private web3: Web3;
  public error: RubicError;
  public connection: any;
  private defaultMockGas: string;
  public ethersProvider: any;

  public get network(): Web3ApiNetwork {
    if (!this.ethereum) {
      return NETWORKS[2];
    }

    return NETWORKS.find(net => net.id === Number(this.ethereum.networkVersion));
  }

  public get address(): string {
    return this.metamaskAddress;
  }

  constructor(private httpClient: HttpClient, provider: ProviderService) {
    if (provider.error) {
      this.error = provider.error;
      return;
    }

    this.web3 = provider.web3;
    this.connection = provider.connection;
    this.ethereum = provider.ethereum;
    this.metamaskAddress = provider.address;
    this.defaultMockGas = provider.defaultMockGas;
    this.ethersProvider = provider.ethersProvider;
  }

  /**
   * @description get account balance in Eth units
   * @param [options] additional options
   * @param [options.address] wallet address whose balance you want to find out
   * @param [options.inWei = false] boolean flag to get integer result in Wei
   * @return account balance in Eth (or in Wei if options.inWei === true)
   */
  public async getBalance(options: { address?: string; inWei?: boolean } = {}): Promise<BigNumber> {
    const balance = await this.web3.eth.getBalance(options.address || this.address);
    return new BigNumber(options.inWei ? balance : this.weiToEth(balance));
  }

  /**
   * @description get ERC-20 tokens balance as integer (multiplied to 10 ** decimals)
   * @param tokenAddress address of the smart-contract corresponding to the token
   * @param [options] additional options
   * @param [options.address = this.address] wallet address whose balance you want to find out
   * @return account tokens balance as integer (multiplied to 10 ** decimals)
   */
  public async getTokenBalance(
    tokenAddress: string,
    options: { address?: string } = {}
  ): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    const balance = await contract.methods.balanceOf(options.address || this.address).call();
    return new BigNumber(balance);
  }

  /**
   * @description send ERC-20 tokens and resolve the promise when the transaction is included in the block
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
          console.log('Tokens transfer error. ' + err);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description send ERC-20 tokens and resolve the promise without waiting for the transaction to be included in the block
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
          console.log('Tokens transfer error. ' + err);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description send Eth in transaction and resolve the promise when the transaction is included in the block
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
          console.log('Tokens transfer error. ' + err);
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
   * @description send Eth in transaction and resolve the promise without waiting for the transaction to be included in the block
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
          console.log('Tokens transfer error. ' + err);
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
   * @description predict the volume of gas required to execute the contract method
   * @param contractAbi abi of smart-contract
   * @param contractAddress address of smart-contract
   * @param methodName method whose execution gas number is to be calculated
   * @param methodArguments arguments of the executed contract method
   * @param [value] The value transferred for the call “transaction” in wei.
   * @return The gas amount estimated
   */
  public async getEstimatedGas(
    contractAbi: any[],
    contractAddress: string,
    methodName: string,
    methodArguments: any[],
    value?: string | BigNumber
  ): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    const gasLimit = await contract.methods[methodName](...methodArguments).estimateGas({
      from: this.address,
      gas: 40000000,
      ...(value && { value })
    });
    return new BigNumber(gasLimit);
  }

  /**
   * @description calculate the average price per unit of gas according to web3
   * @return average gas price in ETH
   */
  public async getGasPriceInETH(): Promise<BigNumber> {
    const gasPrice = await this.web3.eth.getGasPrice();
    return new BigNumber(gasPrice).div(10 ** 18);
  }

  /**
   * @description calculate the gas fee using average price per unit of gas according to web3 and Eth price according to coingecko
   * @param gasLimit gas limit
   * @param etherPrice price of Eth unit
   * @return gas fee in usd$
   */
  public async getGasFee(gasLimit: BigNumber, etherPrice: BigNumber): Promise<BigNumber> {
    const gasPrice = await this.getGasPriceInETH();
    return gasPrice.multipliedBy(gasLimit).multipliedBy(etherPrice);
  }

  public async getAllowance(
    tokenAddress: string,
    spenderAddress: string,
    options: {
      ownerAddress?: string;
    } = {}
  ): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    const allowance = await contract.methods
      .allowance(options.ownerAddress || this.address, spenderAddress)
      .call({ from: this.address });
    return new BigNumber(allowance);
  }

  /**
   * @description execute approve method in ERC-20 token contract
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
          console.log('Tokens approve error. ' + err);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description execute method of smart-contract and resolve the promise when the transaction is included in the block
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName executing method name
   * @param methodArguments executing method arguments
   * @param [options] additional options
   * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
   * @param [options.value] amount in Wei amount to be attached to the transaction
   * @return smart-contract method return value
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
          console.log('Method execution error. ' + err);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description execute method of smart-contract and resolve the promise without waiting for the transaction to be included in the block
   * @param contractAddress address of smart-contract which method is to be executed
   * @param contractAbi abi of smart-contract which method is to be executed
   * @param methodName executing method name
   * @param methodArguments executing method arguments
   * @return smart-contract method return value
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
          console.log('Tokens approve error. ' + err);
          if (err.code === 4001) {
            reject(new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * @description remove approval for token use
   * @param tokenAddress tokenAddress address of the smart-contract corresponding to the token
   * @param spenderAddress wallet or contract address to approve
   */
  public async unApprove(tokenAddress, spenderAddress): Promise<TransactionReceipt> {
    return this.approveTokens(tokenAddress, spenderAddress, new BigNumber(0));
  }

  /**
   * @description convert Eth amount into Wei
   * @param value to convert in Eth
   */
  public ethToWei(value: string | BigNumber): string {
    return this.web3.utils.toWei(value.toString(), 'ether');
  }

  /**
   * @description convert Wei amount into Eth
   * @param value to convert in Wei
   */
  public weiToEth(value: string | BigNumber): string {
    return this.web3.utils.fromWei(value.toString(), 'ether');
  }

  /**
   * @description check if address is Ether native address
   * @param address address to check
   */
  public isEtherAddress(address: string): boolean {
    return address === '0x0000000000000000000000000000000000000000';
  }

  /**
   * get mined transaction gas fee in Ether
   * @param hash transaction hash
   * @param [options] additional options
   * @param [options.inWei = false] if true, then the return value will be in Wei
   * @return transaction gas fee in Ether (or in Wei if options.inWei = true) or null if transaction is not mined
   */
  public async getTransactionGasFee(
    hash: string,
    options: { inWei?: boolean } = {}
  ): Promise<BigNumber> {
    const transaction = await this.getTransactionByHash(hash);
    const receipt = await this.web3.eth.getTransactionReceipt(hash);

    if (!transaction || !receipt) {
      return null;
    }

    const gasPrice = new BigNumber(transaction.gasPrice);
    const gasLimit = new BigNumber(receipt.gasUsed);

    return gasPrice.multipliedBy(gasLimit);
  }

  private async getTransactionByHash(hash: string, attempt?: number): Promise<Transaction> {
    attempt = attempt || 0;
    const limit = 10;
    const timeout = 500;

    if (attempt >= limit) {
      return null;
    }

    const transaction = await this.web3.eth.getTransaction(hash);
    if (transaction === null) {
      return new Promise(resolve =>
        setTimeout(() => resolve(this.getTransactionByHash(hash, attempt + 1)), timeout)
      );
    } else {
      return transaction;
    }
  }

  public isAddressCorrect(address: string) {
    return this.web3.utils.isAddress(address);
  }
}
