import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {BridgeNetwork} from '../bridge/types';
import {ERC20_TOKEN_ABI} from '../web3/web3.constants';
import {RubicError} from '../../errors/RubicError';
import {MetamaskError} from '../../errors/bridge/MetamaskError';
import {AccountError} from '../../errors/bridge/AccountError';
import {UserRejectError} from '../../errors/bridge/UserRejectError';

interface web3ApiNetwork {
  id: number,
  name: string
}

const NETWORKS: web3ApiNetwork[] = [
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
  private ethereum = window.ethereum;
  private web3: Web3;
  public error: RubicError;

  public get network(): web3ApiNetwork {
    return NETWORKS.find(net => net.id === Number(this.ethereum.networkVersion));
  }

  public get address(): string {
    return this.metamaskAddress;
  }


  constructor() {
    if (!this.ethereum) {
      console.log("No Metamask installed");
      this.error = new MetamaskError();
    }

    this.web3 = new Web3(window.ethereum)
    // @ts-ignore
    if (this.web3.currentProvider.isMetaMask) {
      window.ethereum.enable();
      this.metamaskAddress = this.ethereum.selectedAddress;
      if (!this.metamaskAddress) {
        this.error = new AccountError();
        console.log("Web3 init error.  Selected account: " + this.metamaskAddress + ". Network: " + this.network);
      }
    } else {
      this.error = new MetamaskError();
      console.log("Selected other provider")
    }
  }

  public async transferTokens(
      contractAddress: string,
      toAddress: string,
      amount: string,
      onTransactionHash?: (hash: string) => void,
      onTransactionReceipt?: (receipt: string) => void
  ): Promise<string> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], contractAddress);

    return new Promise((resolve, reject) => {
      const onReceipt = (receipt: string) => {
        if (onTransactionReceipt) {
          onTransactionReceipt(receipt);
        }
        resolve(receipt);
      }

      contract.methods.transfer(toAddress, amount).send({from: this.address})
        .on('transactionHash', onTransactionHash || (hash => {}))
        .on('receipt', onReceipt)
        .on('error', err => {
          console.log('Tokens transfer error. ' + err)
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
      value: string,
      onTransactionHash?: (hash: string) => void,
      onTransactionReceipt?: (receipt: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const onReceipt = (receipt: string) => {
        if (onTransactionReceipt) {
          onTransactionReceipt(receipt);
        }
        resolve(receipt);
      }

      this.web3.eth.sendTransaction({
        from: this.address,
        to: toAddress,
        value
      })
      .on('transactionHash', onTransactionHash || (hash => {}))
      .on('receipt', onReceipt)
      .on('error', err => {
        console.log('Tokens transfer error. ' + err)
        // @ts-ignore
        if (err.code === 4001) {
          reject (new UserRejectError());
        } else {
          reject(err);
        }
      });
    });
  }
}
