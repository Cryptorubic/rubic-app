import {HttpService} from '../http/http.service';

const BigNumber = require('bignumber.js');

import {Directive, EventEmitter, Injectable, Output} from '@angular/core';
import Web3 from 'web3';

import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, NG_VALIDATORS, ValidationErrors} from '@angular/forms';
import {Observable} from 'rxjs';

import {ETH_NETWORKS, ERC20_TOKEN_ABI} from './web3.constants';

import { Pipe, PipeTransform } from '@angular/core';
import {map} from 'rxjs/operators';


export interface TokenInfoInterface {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  isEther: boolean;
}

const IS_PRODUCTION = location.protocol === 'https:';



const ETHERSCAN_URLS = {
  ETHERSCAN_ADDRESS: 'https://etherscan.io/',
  ROPSTEN_ETHERSCAN_ADDRESS: 'https://ropsten.etherscan.io/',
};

@Pipe({ name: 'etherscanUrl' })
export class EtherscanUrlPipe implements PipeTransform {
  transform(address, type) {
    const url = IS_PRODUCTION ? ETHERSCAN_URLS.ETHERSCAN_ADDRESS : ETHERSCAN_URLS.ROPSTEN_ETHERSCAN_ADDRESS;
    return url + type + '/' + address;
  }
}



@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  private providers;
  private Web3;

  constructor(
    private httpService: HttpService
  ) {

    this.providers = {};
    try {
      const metaMaskProvider = Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8546');
      // if (metaMaskProvider && metaMaskProvider.publicConfigStore) {
      this.providers.metamask = metaMaskProvider;
      // }

    } catch (err) {
      console.log('Metamask not found');
    }

    try {
      this.providers.parity = new Web3.providers.HttpProvider('http://localhost:8545');
    } catch (err) {
      console.log('Parity not found');
    }

    try {
      this.providers.infura =
        new Web3.providers.HttpProvider(
          IS_PRODUCTION ? ETH_NETWORKS.INFURA_ADDRESS : ETH_NETWORKS.ROPSTEN_INFURA_ADDRESS
        );
    } catch (err) {
      console.log('Infura not found');
    }
    this.Web3 = new Web3(this.providers.infura);

    // this.connectMetamask();
  }


  // public connectMetamask() {
  //   this.setProvider('metamask');
  //   this.Web3.eth.getAccounts((err, addresses) => {
  //     const publicAddress = addresses[0];
  //     if (!publicAddress) {
  //       return;
  //     }
  //     this.Web3.eth.personal.sign(
  //       'Я хочу использовать SWAPS MyWish',
  //       publicAddress,
  //       (signError, signature) => {
  //         console.log(signature);
  //       }
  //     );
  //   });
  // }


  public getContract(abi, address) {
    return this.Web3.eth.Contract(abi, address);
  }


  public getMethodInterface(methodName, abi?) {
    abi = abi || ERC20_TOKEN_ABI;
    return abi.filter((m) => {
      return m.name === methodName;
    })[0];
  }

  public tokenContract(address) {
    return this.Web3.eth.Contract(ERC20_TOKEN_ABI, address);
  }

  public BatchRequest() {
    return new this.Web3.BatchRequest();
  }

  private convertTokenInfo(tokenInfo) {
    return (tokenInfo && tokenInfo.symbol) ? {
      token_short_name: tokenInfo.symbol,
      token_name: tokenInfo.name,
      address: tokenInfo.address,
      decimals: parseInt(tokenInfo.decimals, 10),
      isEther: tokenInfo.address === '0x0000000000000000000000000000000000000000'
    } : false;
  }


  public getFullTokenInfo(tokenAddress) {

    return new Promise((resolve, reject) => {
      this.httpService.get('get_all_tokens/', {
        address: tokenAddress
      }).toPromise().then((result) => {
        result.forEach((tok) => {
          tok.isEther = tok.address === '0x0000000000000000000000000000000000000000';
        });
        if (!result.length) {
          this.getTokenInfo(tokenAddress).then((tokenInfo: {data: TokenInfoInterface}) => {
            const convertedToken = this.convertTokenInfo(tokenInfo.data);

            resolve(convertedToken);
          });
        } else {
          resolve(result[0]);
        }
      });
    });
  }


  public getTokenInfo(tokenAddress) {
    const tokenInfoFields = ['decimals', 'symbol', 'name'];

    let fieldsCount = tokenInfoFields.length;
    const tokenInfo: any = {};

    return new Promise((resolve, reject) => {
      const address = tokenAddress ? tokenAddress.toLowerCase() : tokenAddress;
      if (!this.Web3.utils.isAddress(address)) {
        return resolve({
          ethAddress: true
        });
      }


      const contract = this.Web3.eth.Contract(ERC20_TOKEN_ABI, address);

      tokenInfoFields.map((method) => {
        contract.methods[method]().call().then(result => {
          tokenInfo[method] = result;
          fieldsCount--;
          if (!fieldsCount) {
            tokenInfo.address = tokenAddress;
            resolve({
              data: tokenInfo
            });
          }
        }, (err) => {
          reject({
            tokenAddress: true
          });
        });
      });
    }).then((res) => {
      return res;
    });
  }


  public checkTokenAddress(address) {
    return this.getTokenInfo(address);
  }

  private setProvider(providerName) {

    const usedNetworkVersion = IS_PRODUCTION ? 1 : 3;

    switch (providerName) {
      case 'metamask':
        const networkVersion = Number(this.providers[providerName].publicConfigStore._state.networkVersion);
        if (usedNetworkVersion === networkVersion) {
          this.Web3.setProvider(this.providers[providerName]);
        }
        break;
    }
  }


  private getAccountsByProvider(providerName) {
    return new Promise((resolve, reject) => {
      try {
        this.setProvider(providerName);

        if (window['ethereum'] && window['ethereum'].isMetaMask) {
          window['ethereum'].enable().then(() => {
            this.Web3.eth.getAccounts((err, addresses) => {
              if (!err) {
                resolve({
                  type: providerName,
                  addresses
                });
              }
            });
          }, () => {
            resolve({
              type: providerName,
              addresses: null
            });
          });
        }

        // const accounts = ethereum.enable();

      } catch (err) {
        resolve({
          type: providerName,
          addresses: []
        });
      }
    });
  }


  public getAccounts(owner?) {
    const addressesDictionary: any = {};
    return new Promise((resolve, reject) => {
      this.getAccountsByProvider('metamask').then((addresses: any) => {
        addressesDictionary[addresses.type] = owner ? addresses.addresses.filter((addr) => {
          return addr.toLowerCase() === owner.toLowerCase();
        }) : addresses.addresses;
        this.Web3.setProvider(this.providers.infura);
        resolve(addressesDictionary);
      });
    });
  }

  public encodeFunctionCall(abi, data) {
    return this.Web3.eth.abi.encodeFunctionCall(abi, data);
  }

  public setDefaultAddress(address) {
    this.Web3.eth.defaultAccount = address;
  }

  public sendTransaction(transactionConfig, provider?) {
    if (provider) {
      this.Web3.eth.setProvider(this.providers[provider]);
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        this.Web3.eth.sendTransaction(transactionConfig).then((result) => {
          resolve(result);
        }).finally(() => {
          if (provider) {
            this.Web3.eth.setProvider(this.providers.infura);
          }
        });
      });
    });
  }


  public createTransaction(transactionConfig, provider?) {
    if (provider) {
      this.Web3.setProvider(this.providers[provider]);
    }
    return this.Web3.eth.sendTransaction.request(transactionConfig, () => {
      this.Web3.setProvider(this.providers.infura);
    });
  }


}


// noinspection JSAnnotator
@Directive({
  selector: '[appEthTokenValidator]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: EthTokenValidatorDirective, multi: true }]
})

export class EthTokenValidatorDirective implements AsyncValidator {

  @Output() TokenResolve = new EventEmitter<any>();

  constructor(
    private web3Service: Web3Service
  ) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.web3Service.getFullTokenInfo(ctrl.value).then((result: any) => {
      if (result) {
        this.TokenResolve.emit(result);
        return null;
      } else {
        return {
          token: true
        };
      }
    });
  }
}
