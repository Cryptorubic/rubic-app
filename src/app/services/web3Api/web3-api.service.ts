import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {BridgeNetwork} from '../bridge/types';
import {ERC20_TOKEN_ABI} from '../web3/web3.constants';

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
    name: BridgeNetwork.ETHEREUM
  }
];


@Injectable({
  providedIn: 'root'
})
export class Web3ApiService {

  private readonly metamaskAddress: string;
  private ethereum = window.ethereum;
  private web3: Web3;
  private readonly network: web3ApiNetwork;
  public unblocked: boolean = false;

  constructor() {
    if (!this.ethereum) {
      console.log("No Metamask installed");
      return
    }

    this.web3 = new Web3(window.ethereum)
    // @ts-ignore
    if (this.web3.currentProvider.isMetaMask) {
      window.ethereum.enable();
      this.network = NETWORKS.find(net => net.id === Number(this.ethereum.networkVersion));
      this.metamaskAddress = this.ethereum.selectedAddress;
      if (this.metamaskAddress && this.network) {
        this.unblocked = true;
      } else {
        console.log("Web3 init error.  Selected account: " + this.metamaskAddress + ". Network: " + this.network)
      }
    } else {
      console.log("Selected other provider")
    }
  }

  public get address(): string {
    return this.metamaskAddress;
  }

  public async transferTokens(contractAddress: string, toAddress: string, amount) {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as any[], contractAddress);
    contract.methods.transfer(toAddress, amount).send().then(console.log).catch(console.error);
  }

}
