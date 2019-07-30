import {HttpService} from '../http/http.service';
import {Directive, EventEmitter, Injectable, Output, Pipe, PipeTransform} from '@angular/core';
import Web3 from 'web3';

import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors} from '@angular/forms';
import {Observable} from 'rxjs';

import {ERC20_TOKEN_ABI, ETH_NETWORKS} from './web3.constants';

const BigNumber = require('bignumber.js');


export interface TokenInfoInterface {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  isEther: boolean;
  isEthereum?: boolean;
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
      // if (metaMaskProvider && metaMaskProvider.publicConfigStore) {
      this.providers.metamask = Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8546');
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


  public getSignedMetaMaskMsg(msg, addr) {

    return new Promise((resolve, reject) => {

      this.Web3.eth.setProvider(this.providers.metamask);

      this.Web3.eth.personal.sign(
        msg,
        addr,
        undefined,
        (signError, signature) => {
          if (!signError) {
            resolve(signature);
          } else {
            reject(signError);
          }
        }
      );
    });
  }


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
    return (tokenInfo && tokenInfo.name) ? {
      token_short_name: tokenInfo.symbol,
      token_name: tokenInfo.name,
      address: tokenInfo.address,
      decimals: parseInt(tokenInfo.decimals, 10) || 8,
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
          }, (err) => {
            reject(err);
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
          if ((method !== 'symbol') && (result === null)) {
            reject({
              tokenAddress: true
            });
          }
          tokenInfo[method] = result;
          fieldsCount--;
          if (!fieldsCount) {
            tokenInfo.address = tokenAddress;
            resolve({
              data: tokenInfo
            });
          }
        }, (err) => {
          if (method !== 'symbol') {
            reject({
              tokenAddress: true
            });
          } else {
            fieldsCount--;
            if (!fieldsCount) {
              tokenInfo.address = tokenAddress;
              resolve({
                data: tokenInfo
              });
            }
          }
        });
      });
    }).then((res) => {
      return res;
    });
  }


  private getAccountsByProvider(providerName) {
    const sendNull = (observer) => {
      observer.next({
        type: providerName,
        addresses: null
      });
    };
    return new Observable((observer) => {
      const usedNetworkVersion = IS_PRODUCTION ? 1 : 3;
      if (window['ethereum'] && window['ethereum'].isMetaMask) {
        const networkVersion = Number(window['ethereum'].networkVersion);
        if (usedNetworkVersion !== networkVersion) {
          sendNull(observer);
          return;
        }
        window['ethereum'].on('accountsChanged', (accounts) => {
          observer.next({
            type: providerName,
            addresses: accounts
          });
        });
        window['ethereum'].enable().then((accounts) => {
          observer.next({
            type: providerName,
            addresses: accounts
          });
        }, () => {
          sendNull(observer);
        });
      } else {
        sendNull(observer);
      }
      return {
        unsubscribe() {}
      };
    });
  }

  public getAccounts(owner?) {
    const addressesDictionary: any = {};
    return new Observable((observer) => {
      const accountsSubscriber = this.getAccountsByProvider('metamask').subscribe((addresses: any) => {
        addressesDictionary[addresses.type] = addresses.addresses === null ? null : owner ? addresses.addresses.filter((addr) => {
          return addr.toLowerCase() === owner.toLowerCase();
        }) : addresses.addresses;

        observer.next(addressesDictionary);
        return {
          unsubscribe() {
            accountsSubscriber.unsubscribe();
          }
        };
      });
    });
  }

  public encodeFunctionCall(abi, data) {
    return this.Web3.eth.abi.encodeFunctionCall(abi, data);
  }

  public sendTransaction(transactionConfig, provider?) {
    if (provider) {
      this.Web3.eth.setProvider(this.providers[provider]);
    }
    return new Promise((resolve) => {
      this.Web3.eth.sendTransaction(transactionConfig).then((result) => {
        resolve(result);
      }).finally(() => {
        if (provider) {
          this.Web3.eth.setProvider(this.providers.infura);
        }
      });
    });
  }


  public getSWAPSCoinInfo(data) {

    data.tokens_info = {};

    return new Promise((resolve, reject) => {
      let quoteToken;
      let baseToken;

      if (data.quote_address) {
        quoteToken = window['cmc_tokens'].filter((tk) => {
          return tk.isEthereum && (tk.address === data.quote_address);
        })[0];


        this.getFullTokenInfo(data.quote_address).then((tokenInfo: TokenInfoInterface) => {
          if (quoteToken) {
            data.tokens_info.quote = {
              token: {...quoteToken}
            };
            data.tokens_info.quote.token.decimals = tokenInfo.decimals;
          } else {
            tokenInfo.isEthereum = true;
            data.tokens_info.quote = {
              token: tokenInfo
            };
          }
        }, () => {
          data.tokens_info.quote = {
            token: {...quoteToken}
          };
        }).finally(() => {
          data.tokens_info.quote.amount = data.quote_limit;
          if (data.tokens_info.base) {
            resolve(data);
          }
        });
      } else {
        data.tokens_info.quote = {
          token: window['cmc_tokens'].filter((tk) => {
            return tk.mywish_id === data.quote_coin_id;
          })[0]
        };
        data.tokens_info.quote.amount = data.quote_limit;
        if (data.tokens_info.base) {
          setTimeout(() => {
            resolve(data);
          });
        }
      }

      if (data.base_address) {

        baseToken = {...window['cmc_tokens'].filter((tk) => {
          return tk.isEthereum && (tk.address === data.base_address);
        })[0]};

        this.getFullTokenInfo(data.base_address).then((tokenInfo: TokenInfoInterface) => {
          if (baseToken) {
            data.tokens_info.base = {
              token: baseToken
            };
            data.tokens_info.base.token.decimals = tokenInfo.decimals;
          } else {
            tokenInfo.isEthereum = true;
            data.tokens_info.base = {
              token: tokenInfo
            };
          }
        }, () => {
          data.tokens_info.base = {
            token: {...baseToken}
          };
        }).finally(() => {
          data.tokens_info.base.amount = data.base_limit;
          if (data.tokens_info.quote) {
            resolve(data);
          }
        });
      } else {
        data.tokens_info.base = {
          token: {...window['cmc_tokens'].filter((tk) => {
            return tk.mywish_id === data.base_coin_id;
          })[0]}
        };

        data.tokens_info.base.amount = data.base_limit;
        if (data.tokens_info.quote) {
          setTimeout(() => {
            resolve(data);
          });
        }
      }
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
      console.log(result);
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
