import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {BridgeNetwork} from '../bridge/types';
import {ERC20_TOKEN_ABI} from '../web3/web3.constants';
import {RubicError} from '../../errors/RubicError';
import {UserRejectError} from '../../errors/bridge/UserRejectError';
import BigNumber from 'bignumber.js';
import {HttpClient} from '@angular/common/http';
import {ProviderService} from '../provider/provider.service';
import { TransactionReceipt } from 'web3-eth';

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

  public get network(): Web3ApiNetwork {
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
  }

  public async getBalance(
      options: {address?: string, inWei?: boolean} = { }
  ): Promise<BigNumber> {
    const balance = await this.web3.eth.getBalance(options.address || this.address);
    return new BigNumber(
        options.inWei ? balance :
            this.web3.utils.fromWei(balance, 'ether')
    );
  }

  public async getTokenBalance(tokenAddress: string, options: { address?: string } = { }) {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    const balance = await contract.methods.balanceOf(options.address || this.address).call();
    return new BigNumber(balance);
  }

  public async transferTokens(
      contractAddress: string,
      toAddress: string,
      amount: string | BigNumber,
      options: {
        onTransactionHash?: (hash: string) => void
      } = { }
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], contractAddress);

    return new Promise((resolve, reject) => {

      contract.methods.transfer(toAddress, amount.toString()).send(
          { from: this.address, ...(this.defaultMockGas && {gas: this.defaultMockGas })}
        )
        .on('transactionHash', options.onTransactionHash || (() => {}))
        .on('receipt', resolve)
        .on('error', err => {
          console.log('Tokens transfer error. ' + err);
          if (err.code === 4001) {
            reject (new UserRejectError());
          } else {
            reject(err);
          }
        });
    });
  }

  public async transferTokensWithOnHashResolve(
      contractAddress: string,
      toAddress: string,
      amount: string | BigNumber
  ): Promise<string> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods.transfer(toAddress, amount.toString()).send(
          { from: this.address, ...(this.defaultMockGas && {gas: this.defaultMockGas })}
      )
          .on('transactionHash', hash => resolve(hash))
          .on('error', err => {
            console.log('Tokens transfer error. ' + err);
            if (err.code === 4001) {
              reject (new UserRejectError());
            } else {
              reject(err);
            }
          });
    });
  }

  public async sendTransaction(
      toAddress: string,
      value: BigNumber | string,
      options: {
        onTransactionHash?: (hash: string) => void,
        inWei?: boolean
      } = { }
  ): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction({
        from: this.address,
        to: toAddress,
        value: options.inWei ? value.toString() : this.ethToWei(value),
        ...(this.defaultMockGas && {gas: this.defaultMockGas})
      })
      .on('transactionHash', options.onTransactionHash || (() => {}))
      .on('receipt', receipt => resolve(receipt))
      .on('error', err => {
        console.log('Tokens transfer error. ' + err);
        // @ts-ignore
        if (err.code === 4001) {
          reject (new UserRejectError());
        } else {
          reject(err);
        }
      });
    });
  }

  public async sendTransactionWithOnHashResolve(
      toAddress: string,
      value: string | BigNumber
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction({
        from: this.address,
        to: toAddress,
        value: value.toString(),
        ...(this.defaultMockGas && {gas: this.defaultMockGas})
      })
          .on('transactionHash', hash => resolve(hash))
          .on('error', err => {
            console.log('Tokens transfer error. ' + err);
            // @ts-ignore
            if (err.code === 4001) {
              reject (new UserRejectError());
            } else {
              reject(err);
            }
          });
    });
  }

  /**
   *
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
    const gasVolume = value ?
         await contract.methods[methodName](...methodArguments).estimateGas({value, gas: 40000000}) :
         await contract.methods[methodName](...methodArguments).estimateGas({gas: 40000000});
    return new BigNumber(gasVolume);
  }

  /**
   * @return average gas price in ETH
   */
  public async getGasPriceInETH(): Promise<BigNumber> {
    const gasPrice = await this.web3.eth.getGasPrice();
    return new BigNumber(gasPrice).div(10 ** 18);
  }

  public async getGasFeeInUSD(gasVolume: BigNumber): Promise<BigNumber> {
    const response: any = await this.httpClient
        .get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').toPromise();
    const etherPrice = new BigNumber(response.ethereum.usd);
    const gasPrice = await this.getGasPriceInETH();
    return gasPrice.multipliedBy(gasVolume).multipliedBy(etherPrice);
  }

  public async getAllowance(
    tokenAddress: string,
    spenderAddress: string,
    options: {
      ownerAddress?: string
    } = { }
  ): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    const allowance = await contract.methods.allowance(options.ownerAddress || this.address, spenderAddress)
        .call({from: this.address});
    return new BigNumber(allowance);
  }

  public async approveTokens(
      tokenAddress: string,
      spender: string,
      value: BigNumber,
      options: {
        onTransactionHash?: (hash: string) => void
      } = { }): Promise<TransactionReceipt> {

    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], tokenAddress);

    return new Promise((resolve, reject) => {
      contract.methods.approve(spender, value.toString()).send({
        from: this.address,
        ...(this.defaultMockGas && {gas: this.defaultMockGas})
      })
          .on('transactionHash', options.onTransactionHash || (() => {}))
          .on('receipt', resolve)
          .on('error', err => {
            console.log('Tokens approve error. ' + err);
            if (err.code === 4001) {
              reject (new UserRejectError());
            } else {
              reject(err);
            }
          });
    });
  }

  public executeContractMethod(
      contractAddress: string,
      contractAbi: any[],
      methodName: string,
      methodArguments: any[],
      onTransactionHash?: (hash: string) => void): Promise<any> {

    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods[methodName](...methodArguments).send({from: this.address})
          .on('transactionHash', onTransactionHash || (() => {}))
          .on('receipt', resolve)
          .on('error', err => {
            console.log('Tokens approve error. ' + err);
            if (err.code === 4001) {
              reject (new UserRejectError());
            } else {
              reject(err);
            }
          });
    });
  }

  public executeContractMethodWithOnHashResolve(
      contractAddress: string,
      contractAbi: any[],
      methodName: string,
      methodArguments: any[] ): Promise<any> {

    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

    return new Promise((resolve, reject) => {
      contract.methods[methodName](...methodArguments).send({from: this.address})
          .on('transactionHash', resolve)
          .on('error', err => {
            console.log('Tokens approve error. ' + err);
            if (err.code === 4001) {
              reject (new UserRejectError());
            } else {
              reject(err);
            }
          });
    });
  }

  private ethToWei(value: string | BigNumber) {
    return this.web3.utils.toWei(value.toString(), 'ether');
  }

  private weiToEth(value: string | BigNumber) {
   return this.web3.utils.fromWei(value.toString(), 'ether');
  }
}
