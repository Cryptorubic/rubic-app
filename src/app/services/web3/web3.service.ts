import { Injectable, Pipe, PipeTransform } from '@angular/core';
import Web3 from 'web3';

import { Observable } from 'rxjs';

import { ERC20_TOKEN_ABI, ETH_NETWORKS, CHAIN_OF_NETWORK } from './web3.constants';

// const BigNumber = require('bignumber.js');

const chainIdOfNetwork = {
  1: [1, 3],
  22: [56, 97],
  24: [137, 80001]
};

const nativeCoins = {
  ethereum: {
    address: '0x0000000000000000000000000000000000000000',
    token_title: 'Ethereum',
    token_short_title: 'ETH',
    decimals: 18,
    image_link: 'https://contracts.mywish.io/media/token_images/1027_YdV4BM9.png',
    platform: 'ethereum',
    isNative: true
  },
  binance: {
    address: '0x0000000000000000000000000000000000000000',
    token_title: 'Binance',
    token_short_title: 'BNB',
    decimals: 18,
    image_link: 'https://contracts.mywish.io/media/token_images/1839_X2YWdhl.png',
    platform: 'binance',
    isNative: true
  },
  matic: {
    address: '0x0000000000000000000000000000000000000000',
    token_title: 'Matic',
    token_short_title: 'MATIC',
    decimals: 18,
    image_link: './assets/images/icons/coins/matic.svg',
    platform: 'binance',
    isNative: true
  }
};

declare global {
  interface Window {
    ethereum: any;
  }
}

export interface TokenInfoInterface {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
}

const IS_PRODUCTION = true; // location.protocol === 'https:';

const ETHERSCAN_URLS = {
  ETHERSCAN_ADDRESS: 'https://etherscan.io/',
  ROPSTEN_ETHERSCAN_ADDRESS: 'https://ropsten.etherscan.io/',
  KOVAN_ETHERSCAN_ADDRESS: 'https://kovan.etherscan.io/',
  BNB_ETHERSCAN_ADDRESS: 'https://bscscan.com/',
  ROPSTEN_BNB_ETHERSCAN_ADDRESS: 'https://testnet.bscscan.com/',
  KOVAN_BNB_ETHERSCAN_ADDRESS: 'https://testnet.bscscan.com/',
  MATIC_ETHERSCAN_ADDRESS: 'https://bscscan.com/',
  ROPSTEN_MATIC_ETHERSCAN_ADDRESS: 'https://testnet.bscscan.com/',
  KOVAN_MATIC_ETHERSCAN_ADDRESS: 'https://testnet.bscscan.com/'
};

@Pipe({ name: 'etherscanUrl' })
export class EtherscanUrlPipe implements PipeTransform {
  transform(address, network, type) {
    let url;
    switch (network) {
      case 1:
        url = IS_PRODUCTION
          ? ETHERSCAN_URLS.ETHERSCAN_ADDRESS
          : ETHERSCAN_URLS.KOVAN_ETHERSCAN_ADDRESS;
        break;
      default:
        break;
      case 22:
        url = IS_PRODUCTION
          ? ETHERSCAN_URLS.BNB_ETHERSCAN_ADDRESS
          : ETHERSCAN_URLS.KOVAN_BNB_ETHERSCAN_ADDRESS;
        break;
      case 24:
        url = IS_PRODUCTION
          ? ETHERSCAN_URLS.MATIC_ETHERSCAN_ADDRESS
          : ETHERSCAN_URLS.KOVAN_MATIC_ETHERSCAN_ADDRESS;
        break;
    }
    return `${url + type}/${address}`;
  }
}

@Pipe({ name: 'nativeCoinUrl' })
export class NativeUrlPipe implements PipeTransform {
  // eslint-disable-next-line consistent-return
  transform(network) {
    switch (network) {
      case 1:
        return 'https://etherscan.io/stat/supply';
      case 22:
        return 'https://bscscan.com/stat/supply';
      case 24:
        return '';
      default:
        break;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  constructor() {
    this.cacheTokens = {
      binance: {},
      ethereum: {},
      matic: {}
    };
    this.providers = {};
    try {
      this.providers.metamask =
        Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8546');
    } catch (err) {
      console.log('Metamask not found');
    }

    try {
      this.providers.parity = new Web3.providers.HttpProvider('http://localhost:8545');
    } catch (err) {
      console.log('Parity not found');
    }

    // this.providers.infura = new Web3.providers.HttpProvider(
    //   IS_PRODUCTION
    //     ? ETH_NETWORKS.INFURA_ADDRESS
    //     : ETH_NETWORKS.ROPSTEN_INFURA_ADDRESS,
    // );
    //
    // this.Web3 = new Web3(this.providers.infura);
  }

  private providers;

  private Web3;

  private userAddr;

  public ethereum = window.ethereum;

  private cacheTokens: {
    [address: string]: any;
  };

  public getSignedMetaMaskMsg(msg, addr) {
    return new Promise((resolve, reject) => {
      if (this.Web3) {
        this.Web3.eth.setProvider(this.providers.metamask);
      } else {
        this.Web3 = new Web3(this.providers.metamask);
      }
      this.Web3.eth.personal.sign(msg, addr, undefined, (signError, signature) => {
        if (!signError) {
          resolve(signature);
        } else {
          reject(signError);
        }
      });
    });
  }

  public async authMetamask() {
    this.ethereum.request({
      method: 'eth_requestAccounts'
    });
  }

  public setUserAddress() {
    this.userAddr = window.ethereum.selectedAddress;
  }

  public getUserAddress() {
    return this.userAddr;
  }

  public getContract(abi, address, network) {
    const currentProvider = new Web3.providers.HttpProvider(
      IS_PRODUCTION
        ? ETH_NETWORKS[CHAIN_OF_NETWORK[network]].INFURA_ADDRESS
        : ETH_NETWORKS[CHAIN_OF_NETWORK[network]].KOVAN_INFURA_ADDRESS
    );
    if (!this.Web3) {
      this.Web3 = new Web3(currentProvider);
    } else {
      this.Web3.eth.setProvider(currentProvider);
    }
    return new this.Web3.eth.Contract(abi, address);
  }

  public getMethodInterface(methodName, abi?) {
    abi = abi || ERC20_TOKEN_ABI;
    return abi.filter(m => {
      return m.name === methodName;
    })[0];
  }

  private convertTokenInfo(tokenInfo) {
    return tokenInfo && tokenInfo.name
      ? {
          token_short_title: tokenInfo.symbol,
          token_title: tokenInfo.name,
          address: tokenInfo.address,
          decimals: parseInt(tokenInfo.decimals, 10) || 8
        }
      : false;
  }

  public getFullTokenInfo(tokenAddress, network?: string | number) {
    let blockchain;
    if (network) {
      if (typeof network === 'string') {
        blockchain = network;
      } else {
        blockchain = CHAIN_OF_NETWORK[network];
      }
    }

    return new Promise((resolve, reject) => {
      if (!tokenAddress) {
        resolve(null);
        return;
      }
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        resolve({ ...nativeCoins[blockchain] });
      } else {
        // eslint-disable-next-line prefer-destructuring
        const tokenObject = window['coingecko_tokens'].filter(tk => {
          return tk.address && tk.address.toLowerCase() === tokenAddress.toLowerCase();
        })[0];
        this.getTokenInfo(tokenAddress, tokenObject, blockchain).then(
          (tokenInfo: { data: TokenInfoInterface }) => {
            const convertedToken = this.convertTokenInfo(tokenInfo.data);
            if (convertedToken) {
              const returnCoin = tokenObject ? { ...tokenObject } : { ...convertedToken };
              returnCoin.custom = !tokenObject;
              returnCoin.decimals = convertedToken.decimals;
              resolve(returnCoin);
            } else {
              resolve({ ...convertedToken });
            }
          },
          err => {
            reject(err);
          }
        );
      }
    });
  }

  public getTokenInfo(tokenAddress, tokenObject, blockchain) {
    const currentProvider = new Web3.providers.HttpProvider(
      IS_PRODUCTION
        ? ETH_NETWORKS[blockchain].INFURA_ADDRESS
        : ETH_NETWORKS[blockchain].KOVAN_INFURA_ADDRESS
    );
    if (!this.Web3) {
      this.Web3 = new Web3(currentProvider);
    } else {
      this.Web3.eth.setProvider(currentProvider);
    }

    const tokenInfoFields = !tokenObject ? ['decimals', 'symbol', 'name'] : ['decimals'];
    let fieldsCount = tokenInfoFields.length;
    const tokenInfo: any = tokenObject
      ? {
          symbol: tokenObject.token_short_title,
          name: tokenObject.token_title
        }
      : {};

    const address = tokenAddress ? tokenAddress.toLowerCase() : tokenAddress;
    const tokensCache = this.cacheTokens[blockchain];
    if (tokensCache[address]) {
      if (tokensCache[address].token || tokensCache[address].failed) {
        // eslint-disable-next-line consistent-return
        return new Promise((resolve, reject) => {
          if (tokensCache[address].failed) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject({
              tokenAddress: true
            });
          }

          if (!this.Web3.utils.isAddress(address)) {
            return resolve({
              ethAddress: true
            });
          }
          resolve({
            data: { ...tokensCache[address].token }
          });
        }).then(res => {
          return res;
        });
      }
      if (tokensCache[address].inPromise) {
        if (this.Web3.utils.isAddress(address)) {
          return tokensCache[address].inPromise;
        }
      }
    }

    // eslint-disable-next-line consistent-return
    const tokenPromise = new Promise((resolve, reject) => {
      if (!this.Web3.utils.isAddress(address)) {
        return resolve({
          ethAddress: true
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const currentProvider = new Web3.providers.HttpProvider(
        IS_PRODUCTION
          ? ETH_NETWORKS[blockchain].INFURA_ADDRESS
          : ETH_NETWORKS[blockchain].KOVAN_INFURA_ADDRESS
      );

      const contract = new new Web3(currentProvider).eth.Contract(
        ERC20_TOKEN_ABI as any[],
        address
      );
      const callMethod = (methodCall, method) => {
        const promise = methodCall.call();
        promise.then(
          result => {
            if (method !== 'symbol' && result === null) {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject({
                tokenAddress: true
              });
              tokensCache[address].failed = true;
              return;
            }
            tokenInfo[method] = result;
            fieldsCount--;
            if (!fieldsCount) {
              tokenInfo.address = tokenAddress;
              tokensCache[address].token = { ...tokenInfo };
              resolve({
                data: { ...tokensCache[address].token }
              });
            }
          },
          err => {
            console.log(`${method}: ${err}`);
            if (method !== 'symbol') {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject({
                tokenAddress: true
              });
              tokensCache[address].failed = true;
            } else {
              fieldsCount--;
              if (!fieldsCount) {
                tokenInfo.address = tokenAddress;
                tokensCache[address].token = { ...tokenInfo };
                resolve({
                  data: { ...tokensCache[address].token }
                });
              }
            }
          }
        );
        return promise;
      };

      const tokenInfoPromises = [];
      // eslint-disable-next-line array-callback-return
      tokenInfoFields.map(method => {
        const methodCall = contract.methods[method]();
        tokenInfoPromises.push(callMethod(methodCall, method));
      });
      Promise.all(tokenInfoPromises).catch(err => reject(err));
    }).then(res => {
      return res;
    });

    tokensCache[address] = {
      inPromise: tokenPromise
    };

    return tokenPromise;
  }

  private getAccountsByProvider(providerName, ifEnabled?, network?) {
    return new Observable(observer => {
      network = network || 1;

      const chainIds = chainIdOfNetwork[network];
      const usedNetworkVersion = chainIds[IS_PRODUCTION ? 0 : 1];

      if (window['ethereum'] && window['ethereum'].isMetaMask) {
        const networkVersion = Number(window['ethereum'].networkVersion);
        if (usedNetworkVersion !== networkVersion) {
          observer.error({
            code: 2,
            msg: 'Please choose main net network in Metamask.'
          });
          return;
        }
        window['ethereum'].on('accountsChanged', accounts => {
          observer.next({
            type: providerName,
            addresses: accounts
          });
        });

        if (!ifEnabled || window['ethereum'].selectedAddress) {
          // this.ethereum.request('eth_requestAccounts').then((a) => {
          //   console.log(a);
          // }, (b) => {
          //   console.log(b);
          // })
          window['ethereum'].enable().then(
            accounts => {
              observer.next({
                type: providerName,
                addresses: accounts
              });
            },
            () => {
              observer.error({
                code: 3
              });
            }
          );
        } else {
          observer.error({
            code: 3
          });
        }
      } else {
        observer.error({
          code: 1,
          msg:
            'Metamask extension is not found. You can install it from <a href="https://metamask.io" target="_blank">metamask.io</a>'
        });
      }
      // eslint-disable-next-line consistent-return
      return {
        unsubscribe() {}
      };
    });
  }

  public getAccounts(owner?, ifEnabled?, network?) {
    const addressesDictionary: any = {};
    return new Observable(observer => {
      const accountsSubscriber = this.getAccountsByProvider(
        'metamask',
        ifEnabled,
        network
      ).subscribe(
        (addresses: any) => {
          addressesDictionary[addresses.type] =
            // eslint-disable-next-line no-nested-ternary
            addresses.addresses === null
              ? undefined
              : owner
              ? addresses.addresses.filter(addr => {
                  return addr.toLowerCase() === owner.toLowerCase();
                })
              : addresses.addresses;

          observer.next(addressesDictionary);
          observer.complete();
          return {
            unsubscribe() {
              accountsSubscriber.unsubscribe();
            }
          };
        },
        error => {
          observer.error(error);
        }
      );
    });
  }

  public encodeFunctionCall(abi, data) {
    return this.Web3.eth.abi.encodeFunctionCall(abi, data);
  }

  public sendTransaction(transactionConfig, network, afterConfirm = undefined) {
    const currentProvider = new Web3.providers.HttpProvider(
      IS_PRODUCTION
        ? ETH_NETWORKS[CHAIN_OF_NETWORK[network]].INFURA_ADDRESS
        : ETH_NETWORKS[CHAIN_OF_NETWORK[network]].KOVAN_INFURA_ADDRESS
    );
    return new Promise((resolve, reject) => {
      return this.getAccounts(false, false, network)
        .toPromise()
        .then(
          (res: any) => {
            // eslint-disable-next-line prefer-destructuring
            transactionConfig.from = res.metamask[0];

            this.Web3.eth.setProvider(this.providers['metamask']);

            this.Web3.eth
              .sendTransaction(transactionConfig, (err, hash) => {
                if (!err) {
                  if (afterConfirm && typeof afterConfirm === 'function') {
                    afterConfirm(hash);
                  }
                  const trxSubscription = setInterval(() => {
                    this.Web3.eth.getTransactionReceipt(hash, (error, transaction) => {
                      if (transaction) {
                        if (transaction.status) {
                          resolve(transaction);
                        } else {
                          reject(err);
                        }
                        clearInterval(trxSubscription);
                      }
                      if (error) {
                        clearInterval(trxSubscription);
                      }
                    });
                  }, 1000);
                } else {
                  reject(err);
                }
              })
              .then(
                result => {
                  console.log(result);
                },
                err => {
                  console.log(err);
                }
              )
              .finally(() => {
                this.Web3.eth.setProvider(currentProvider);
              });
          },
          () => {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({
              code: 2,
              msg: 'Please choose main net network in Metamask.'
            });
          }
        );
    });
  }

  public getSWAPSCoinInfo(data) {
    data.tokens_info = {};

    return new Promise(resolve => {
      let quoteToken;
      let baseToken;

      // Check quote coin
      let quoteTokenObject;
      if (data.quote_address === '0x0000000000000000000000000000000000000000') {
        quoteTokenObject = { ...nativeCoins[CHAIN_OF_NETWORK[data.network]] };
        data.tokens_info.quote = {
          token: { ...quoteTokenObject },
          amount: data.quote_limit
        };
        if (data.tokens_info.base) {
          resolve(data);
        }
      } else {
        // eslint-disable-next-line prefer-destructuring
        quoteTokenObject = window['coingecko_tokens'].filter(tk => {
          return (
            CHAIN_OF_NETWORK[data.network] === tk.platform && tk.address === data.quote_address
          );
        })[0];
        if (quoteTokenObject && !data.quote_address) {
          data.quote_address = quoteTokenObject.address;
        }
        const currentProvider = new Web3.providers.HttpProvider(
          IS_PRODUCTION
            ? ETH_NETWORKS[CHAIN_OF_NETWORK[data.network]].INFURA_ADDRESS
            : ETH_NETWORKS[CHAIN_OF_NETWORK[data.network]].KOVAN_INFURA_ADDRESS
        );
        if (!this.Web3) {
          this.Web3 = new Web3(currentProvider);
        } else {
          this.Web3.eth.setProvider(currentProvider);
        }

        quoteToken = quoteTokenObject ? { ...quoteTokenObject } : false;
        this.getFullTokenInfo(data.quote_address, data.network)
          .then(
            (tokenInfo: TokenInfoInterface) => {
              if (quoteToken) {
                data.tokens_info.quote = {
                  token: { ...quoteToken }
                };
                data.tokens_info.quote.token.decimals = tokenInfo.decimals;
              } else {
                data.tokens_info.quote = {
                  token: { ...tokenInfo }
                };
              }
            },
            () => {
              data.tokens_info.quote = {
                token: { ...quoteToken }
              };
            }
          )
          .finally(() => {
            data.tokens_info.quote.amount = data.quote_limit;
            if (data.tokens_info.base) {
              resolve(data);
            }
          });
      }

      // Check base coin
      let baseTokenObject;
      if (data.base_address === '0x0000000000000000000000000000000000000000') {
        quoteTokenObject = { ...nativeCoins[CHAIN_OF_NETWORK[data.network]] };
        data.tokens_info.base = {
          token: { ...quoteTokenObject },
          amount: data.base_limit
        };
        if (data.tokens_info.quote) {
          resolve(data);
        }
      } else {
        // eslint-disable-next-line prefer-destructuring
        baseTokenObject = window['coingecko_tokens'].filter(tk => {
          return CHAIN_OF_NETWORK[data.network] === tk.platform && tk.address === data.base_address;
        })[0];

        if (baseTokenObject && !data.base_address) {
          data.base_address = baseTokenObject.address;
        }

        baseToken = baseTokenObject ? { ...baseTokenObject } : false;
        this.getFullTokenInfo(data.base_address, data.network)
          .then(
            (tokenInfo: TokenInfoInterface) => {
              if (baseToken) {
                data.tokens_info.base = {
                  token: { ...baseToken }
                };
                data.tokens_info.base.token.decimals = tokenInfo.decimals;
              } else {
                data.tokens_info.base = {
                  token: { ...tokenInfo }
                };
              }
            },
            () => {
              data.tokens_info.base = {
                token: { ...baseToken }
              };
            }
          )
          .finally(() => {
            data.tokens_info.base.amount = data.base_limit;
            if (data.tokens_info.quote) {
              resolve(data);
            }
          });
      }
    });
  }
}
