import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import { EMPTY, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { WrongToken } from 'src/app/core/errors/models/provider/WrongToken';
import { TransactionReceipt } from 'web3-eth';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import {
  rubicBridgeContractAddressesNetMode,
  rubicTokenAddressesNetMode
} from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/constants/addressesNetMode';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { HttpService } from 'src/app/core/services/http/http.service';
import rubicBridgeContractAbi from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/constants/rubicBridgeContractAbi';

import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import CustomError from '@core/errors/models/custom-error';
import { BlockchainsBridgeProvider } from '../../blockchains-bridge-provider';

interface RubicConfig {
  maxAmount: number;
  swapContractAddress: string;
  rubicTokenAddress: string;
}

interface RubicApiResponse {
  min_amount: string;
  token_address: string;
  swap_address: string;
  fee: string;
  network: 'Ethereum' | 'Binance-Smart-Chain';
}

interface RubicTrade {
  token: {
    address: string;
    decimals: number;
    symbol: string;
  };
  amount: BigNumber;
  swapContractAddress: string;
}

type RubicBridgeBlockchains = BLOCKCHAIN_NAME.ETHEREUM | BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

@Injectable()
export class EthereumBinanceRubicBridgeProviderService extends BlockchainsBridgeProvider {
  private readonly apiUrl = 'https://bridge-api.rubic.exchange/api/v1/';

  private readonly contractAbi = rubicBridgeContractAbi;

  private rubicConfig: {
    [BLOCKCHAIN_NAME.ETHEREUM]: RubicConfig;
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: RubicConfig;
  };

  private readonly rubicConfigMaxAmount = 100_000;

  constructor(
    private readonly httpService: HttpService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly useTestingMode: UseTestingModeService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly errorService: ErrorsService
  ) {
    super();

    this.rubicConfig = {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        maxAmount: this.rubicConfigMaxAmount,
        swapContractAddress: rubicBridgeContractAddressesNetMode.mainnet[BLOCKCHAIN_NAME.ETHEREUM],
        rubicTokenAddress: rubicTokenAddressesNetMode.mainnet[BLOCKCHAIN_NAME.ETHEREUM]
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        maxAmount: this.rubicConfigMaxAmount,
        swapContractAddress:
          rubicBridgeContractAddressesNetMode.mainnet[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN],
        rubicTokenAddress: rubicTokenAddressesNetMode.mainnet[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
      }
    };
    this.loadRubicTokenInfo();

    this.initTestingMode();
  }

  private initTestingMode(): void {
    this.useTestingMode.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.rubicConfig = {
          [BLOCKCHAIN_NAME.ETHEREUM]: {
            maxAmount: this.rubicConfigMaxAmount,
            swapContractAddress:
              rubicBridgeContractAddressesNetMode.testnet[BLOCKCHAIN_NAME.ETHEREUM],
            rubicTokenAddress: rubicTokenAddressesNetMode.testnet[BLOCKCHAIN_NAME.ETHEREUM]
          },
          [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
            maxAmount: this.rubicConfigMaxAmount,
            swapContractAddress:
              rubicBridgeContractAddressesNetMode.testnet[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN],
            rubicTokenAddress:
              rubicTokenAddressesNetMode.testnet[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
          }
        };
        this.loadRubicTokenInfo();
      }
    });
  }

  private async loadRubicTokenInfo(): Promise<void> {
    this.httpService
      .get('networks/', {}, this.apiUrl)
      .pipe(
        timeout(3000),
        catchError((e: unknown) => {
          console.error(e);
          this._tokenPairs$.next(List([]));
          return EMPTY;
        })
      )
      .subscribe((response: RubicApiResponse[]) => {
        if (!response) {
          this._tokenPairs$.next(List([]));
          return;
        }
        const ethContractData = response.find(data => data.network === 'Ethereum');
        const bscContractData = response.find(data => data.network === 'Binance-Smart-Chain');

        const bridgeTokenPair: BridgeTokenPair = {
          symbol: 'RBC',
          image: '',
          rank: 0,

          tokenByBlockchain: {
            [BLOCKCHAIN_NAME.ETHEREUM]: {
              blockchain: BLOCKCHAIN_NAME.ETHEREUM,
              address: this.rubicConfig[BLOCKCHAIN_NAME.ETHEREUM].rubicTokenAddress,
              name: 'Rubic',
              symbol: 'RBC',
              decimals: 18,
              minAmount: parseFloat(ethContractData.min_amount),
              maxAmount: this.rubicConfig[BLOCKCHAIN_NAME.ETHEREUM].maxAmount
            },
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
              blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
              address: this.rubicConfig[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].rubicTokenAddress,
              name: 'Rubic',
              symbol: 'BRBC',
              decimals: 18,
              minAmount: parseFloat(bscContractData.min_amount),
              maxAmount: this.rubicConfig[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].maxAmount
            }
          },

          fromEthFee: parseFloat(bscContractData.fee),
          toEthFee: parseFloat(ethContractData.fee)
        };
        this._tokenPairs$.next(List([bridgeTokenPair]));
      });
  }

  public getProviderType(): BRIDGE_PROVIDER {
    return BRIDGE_PROVIDER.SWAP_RBC;
  }

  public getFee(tokenPair: BridgeTokenPair, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    if (toBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      return of(tokenPair.toEthFee);
    }
    return of(tokenPair.fromEthFee);
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    return new Observable(subscriber => {
      this.createRubicTrade(bridgeTrade)
        .then(receipt => {
          this.bridgeApiService.notifyBridgeBot(
            bridgeTrade,
            receipt.transactionHash,
            this.walletConnectorService.address
          );
          subscriber.next(receipt);
        })
        .catch(err => {
          subscriber.error(err);
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  }

  public needApprove(bridgeTrade: BridgeTrade): Observable<boolean> {
    const { token } = bridgeTrade;
    if (BlockchainsInfo.getBlockchainType(bridgeTrade.fromBlockchain) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
    const blockchainAdapter = this.publicBlockchainAdapterService[
      bridgeTrade.fromBlockchain
    ] as EthLikeWeb3Public;
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];

    if (token.symbol !== 'RBC') {
      return throwError(new WrongToken());
    }

    return from(
      blockchainAdapter.getAllowance({
        tokenAddress:
          this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeBlockchains].rubicTokenAddress,
        ownerAddress: this.walletConnectorService.address,
        spenderAddress:
          this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeBlockchains].swapContractAddress
      })
    ).pipe(
      map(allowance => bridgeTrade.amount.multipliedBy(10 ** tokenFrom.decimals).gt(allowance))
    );
  }

  public approve(bridgeTrade: BridgeTrade): Observable<TransactionReceipt> {
    const { token } = bridgeTrade;
    const tokenFrom = token.tokenByBlockchain[bridgeTrade.fromBlockchain];
    const spenderAddress =
      this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeBlockchains].swapContractAddress;

    if (token.symbol !== 'RBC') {
      this.errorService.throw(new WrongToken());
    }

    return this.needApprove(bridgeTrade).pipe(
      switchMap(needApprove => {
        if (!needApprove) {
          console.error('You should check bridge trade allowance before approve');
          return throwError(new UndefinedError());
        }
        return from(
          this.web3PrivateService.approveTokens(tokenFrom.address, spenderAddress, 'infinity', {
            onTransactionHash: bridgeTrade.onTransactionHash
          })
        );
      })
    );
  }

  private async createRubicTrade(bridgeTrade: BridgeTrade): Promise<TransactionReceipt> {
    const { token } = bridgeTrade;

    if (token.symbol !== 'RBC') {
      throw new WrongToken();
    }

    const blockchainAdapter = this.publicBlockchainAdapterService[bridgeTrade.fromBlockchain];
    const trade: RubicTrade = {
      token: {
        address:
          this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeBlockchains].rubicTokenAddress,
        decimals: token.tokenByBlockchain[bridgeTrade.fromBlockchain].decimals
      }
    } as RubicTrade;

    trade.token.symbol = bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? 'RBC' : 'BRBC';
    trade.swapContractAddress =
      this.rubicConfig[bridgeTrade.fromBlockchain as RubicBridgeBlockchains].swapContractAddress;

    trade.amount = bridgeTrade.amount.multipliedBy(10 ** trade.token.decimals);

    const onApprove = bridgeTrade.onTransactionHash;
    if (BlockchainsInfo.getBlockchainType(bridgeTrade.fromBlockchain) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
    await this.provideAllowance(trade, blockchainAdapter as EthLikeWeb3Public, onApprove);

    const blockchain = bridgeTrade.fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? 1 : 2;

    const onTradeTransactionHash = async (hash: string) => {
      if (bridgeTrade.onTransactionHash) {
        bridgeTrade.onTransactionHash(hash);
      }
      await this.bridgeApiService.postRubicTransaction(
        bridgeTrade.fromBlockchain,
        hash,
        trade.amount.toFixed(),
        this.walletConnectorService.address
      );
    };

    return this.web3PrivateService.executeContractMethod(
      trade.swapContractAddress,
      this.contractAbi,
      'transferToOtherBlockchain',
      [blockchain, trade.amount.toFixed(0), bridgeTrade.toAddress],
      {
        onTransactionHash: onTradeTransactionHash
      }
    );
  }

  private async provideAllowance(
    trade: RubicTrade,
    web3Public: EthLikeWeb3Public,
    onApprove: (hash: string) => void
  ): Promise<void> {
    const allowance = await web3Public.getAllowance({
      tokenAddress: trade.token.address,
      ownerAddress: this.walletConnectorService.address,
      spenderAddress: trade.swapContractAddress
    });
    if (trade.amount.gt(allowance)) {
      const uintInfinity = new BigNumber(2).pow(256).minus(1);
      await this.web3PrivateService.approveTokens(
        trade.token.address,
        trade.swapContractAddress,
        uintInfinity,
        {
          onTransactionHash: onApprove
        }
      );
    }
  }
}
