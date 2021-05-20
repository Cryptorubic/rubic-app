import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, defer, Observable, Subscription, throwError } from 'rxjs';
import { List } from 'immutable';
import { catchError, first, mergeMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { TranslateService } from '@ngx-translate/core';
import { Web3PrivateService } from '../../../core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeToken } from '../models/BridgeToken';
import { TokensService } from '../../../core/services/backend/tokens-service/tokens.service';
import SwapToken from '../../../shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '../../../core/services/use-testing-mode/use-testing-mode.service';
import { bridgeTestTokens } from '../../../../test/tokens/bridge-tokens';
import { BlockchainsBridgeProvider } from './blockchains-bridge-provider/blockchains-bridge-provider';
import { EthereumBinanceBridgeProviderService } from './blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from './blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { EthereumPolygonBridgeProviderService } from './blockchains-bridge-provider/ethereum-polygon-bridge-provider/ethereum-polygon-bridge-provider.service';
import { MetamaskError } from '../../../shared/models/errors/provider/MetamaskError';
import { AccountError } from '../../../shared/models/errors/provider/AccountError';
import { NetworkError } from '../../../shared/models/errors/provider/NetworkError';
import { BridgeTrade } from '../models/BridgeTrade';
import { BridgeApiService } from '../../../core/services/backend/bridge-api/bridge-api.service';
import { UserRejectError } from '../../../shared/models/errors/provider/UserRejectError';
import InsufficientFundsError from '../../../shared/models/errors/instant-trade/InsufficientFundsError';
import { Web3PublicService } from '../../../core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from '../../../core/services/blockchain/web3-public-service/Web3Public';
import { BridgeTableTrade } from '../models/BridgeTableTrade';
import { AuthService } from '../../../core/services/auth/auth.service';
import { EthereumTronBridgeProviderService } from './blockchains-bridge-provider/ethereum-tron-bridge-provider/ethereum-tron-bridge-provider.service';
import { BinanceTronBridgeProviderService } from './blockchains-bridge-provider/binance-tron-bridge-provider/binance-tron-bridge-provider.service';

@Injectable()
export class BridgeService implements OnDestroy {
  private readonly USER_REJECT_ERROR_CODE = 4001;

  private bridgeProvider: BlockchainsBridgeProvider;

  private selectedBlockchains: [BLOCKCHAIN_NAME, BLOCKCHAIN_NAME];

  private _tokens: BehaviorSubject<List<BridgeToken>> = new BehaviorSubject(List([]));

  public readonly tokens: Observable<List<BridgeToken>> = this._tokens.asObservable();

  private _swapTokens: List<SwapToken> = List([]);

  private _swapTokensSubscription$: Subscription;

  private _blockchainTokens = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: List([]),
      [BLOCKCHAIN_NAME.POLYGON]: List([]),
      [BLOCKCHAIN_NAME.TRON]: List([])
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
      [BLOCKCHAIN_NAME.TRON]: List([])
    }
  };

  private _transactions: BehaviorSubject<List<BridgeTableTrade>> = new BehaviorSubject(null);

  public readonly transactions: Observable<
    List<BridgeTableTrade>
  > = this._transactions.asObservable();

  public walletAddress: Observable<string>;

  private _currentUserSubscription$: Subscription;

  private _useTestingModeSubscription$: Subscription;

  private _isTestingMode: boolean;

  constructor(
    private bridgeApiService: BridgeApiService,
    private ethereumBinanceBridgeProviderService: EthereumBinanceBridgeProviderService,
    private rubicBridgeProviderService: EthereumBinanceRubicBridgeProviderService,
    private ethereumPolygonBridgeProviderService: EthereumPolygonBridgeProviderService,
    private ethereumTronBridgeProviderService: EthereumTronBridgeProviderService,
    private binanceTronBridgeProviderService: BinanceTronBridgeProviderService,
    private tokensService: TokensService,
    private web3PrivateService: Web3PrivateService,
    private web3PublicService: Web3PublicService,
    private authService: AuthService,
    private useTestingModeService: UseTestingModeService,
    private readonly translateService: TranslateService
  ) {
    this._swapTokensSubscription$ = this.tokensService.tokens.subscribe(swapTokens => {
      this._swapTokens = swapTokens;
      this.updateTransactionsList();
      this.setTokens();
    });

    this.walletAddress = this.web3PrivateService.onAddressChanges;

    this._currentUserSubscription$ = this.authService.getCurrentUser().subscribe(() => {
      this.updateTransactionsList();
    });

    this._useTestingModeSubscription$ = useTestingModeService.isTestingMode.subscribe(
      isTestingMode => {
        this._isTestingMode = isTestingMode;
        this.setTokens();
      }
    );
  }

  ngOnDestroy(): void {
    this._swapTokensSubscription$.unsubscribe();
    this._currentUserSubscription$.unsubscribe();
    this._useTestingModeSubscription$.unsubscribe();
  }

  public async setBlockchains(
    fromBlockchain: BLOCKCHAIN_NAME,
    toBlockchain: BLOCKCHAIN_NAME
  ): Promise<void> {
    this._tokens.next(List([]));

    if (fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM || toBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      const nonEthereumBlockchain =
        fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM ? fromBlockchain : toBlockchain;
      this.selectedBlockchains = [BLOCKCHAIN_NAME.ETHEREUM, nonEthereumBlockchain];

      switch (nonEthereumBlockchain) {
        case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
          this.bridgeProvider = this.ethereumBinanceBridgeProviderService;
          break;
        case BLOCKCHAIN_NAME.POLYGON:
          this.bridgeProvider = this.ethereumPolygonBridgeProviderService;
          break;
        default:
          this.bridgeProvider = this.ethereumTronBridgeProviderService;
      }
    } else {
      this.selectedBlockchains = [
        BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        fromBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ? fromBlockchain : toBlockchain
      ];

      this.bridgeProvider = this.binanceTronBridgeProviderService;
    }

    this.setTokens();
  }

  private setTokens(): void {
    if (!this._swapTokens.size || !this.selectedBlockchains) {
      this._tokens.next(List([]));
      return;
    }

    const firstBlockchain = this.selectedBlockchains[0];
    const secondBlockchain = this.selectedBlockchains[1];
    if (this._isTestingMode) {
      this._tokens.next(bridgeTestTokens[secondBlockchain]);
      return;
    }
    if (this._blockchainTokens[firstBlockchain][secondBlockchain]?.size) {
      this._tokens.next(this._blockchainTokens[firstBlockchain][secondBlockchain]);
      return;
    }

    this.bridgeProvider
      .getTokensList(this._swapTokens)
      .pipe(first())
      .subscribe(tokensList => {
        this._blockchainTokens[firstBlockchain][
          secondBlockchain
        ] = this.getTokensWithImagesAndRanks(tokensList);
        if (
          this.selectedBlockchains[0] === firstBlockchain &&
          this.selectedBlockchains[1] === secondBlockchain
        ) {
          this._tokens.next(this._blockchainTokens[firstBlockchain][secondBlockchain]);
        }
      });
  }

  private getTokensWithImagesAndRanks(tokens: List<BridgeToken>): List<BridgeToken> {
    return tokens.map(token => {
      const ethToken = this._swapTokens
        .filter(item => item.image)
        .find(
          item =>
            token.blockchainToken[item.blockchain]?.address.toLowerCase() ===
            item.address.toLowerCase()
        );
      token.image = ethToken?.image || '/assets/images/icons/coins/empty.svg';
      token.rank = ethToken?.rank;
      return token;
    });
  }

  public getFee(token: BridgeToken, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    return this.bridgeProvider.getFee(token, toBlockchain);
  }

  public checkIfEthereumGasPriceIsHigh(): Observable<boolean> {
    return this.rubicBridgeProviderService.checkIfEthereumGasPriceIsHigh();
  }

  private checkSettings(blockchain: BLOCKCHAIN_NAME): void {
    if (!this.web3PrivateService.isProviderActive) {
      throw new MetamaskError(this.translateService);
    }

    if (!this.web3PrivateService.address) {
      throw new AccountError(this.translateService);
    }

    if (
      this.web3PrivateService.network?.name !== blockchain &&
      (!this.useTestingModeService.isTestingMode.getValue() ||
        this.web3PrivateService.network?.name !== `${blockchain}_TESTNET`) &&
      (!this.useTestingModeService.isTestingMode.getValue() ||
        blockchain !== BLOCKCHAIN_NAME.ETHEREUM ||
        this.web3PrivateService.network?.name !== BLOCKCHAIN_NAME.GOERLI_TESTNET)
    ) {
      throw new NetworkError(blockchain, this.translateService);
    }
  }

  private async checkBalance(
    blockchain: BLOCKCHAIN_NAME,
    tokenAddress: string,
    symbol: string,
    decimals: number,
    amount: BigNumber
  ): Promise<void> {
    let web3Public: Web3Public;
    if (this._isTestingMode && blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      web3Public = this.web3PublicService[BLOCKCHAIN_NAME.GOERLI_TESTNET];
    } else {
      web3Public = this.web3PublicService[blockchain];
    }

    let balance;
    if (web3Public.isNativeAddress(tokenAddress)) {
      balance = await web3Public.getBalance(this.web3PrivateService.address, {
        inWei: true
      });
    } else {
      balance = await web3Public.getTokenBalance(this.web3PrivateService.address, tokenAddress);
    }

    const amountInWei = amount.multipliedBy(10 ** decimals);
    if (balance.lt(amountInWei)) {
      const formattedTokensBalance = balance.div(10 ** decimals).toString();
      throw new InsufficientFundsError(
        symbol,
        formattedTokensBalance,
        amount.toFixed(),
        this.translateService
      );
    }
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    return defer(async () => {
      this.checkSettings(bridgeTrade.fromBlockchain);
      const token = bridgeTrade.token.blockchainToken[bridgeTrade.fromBlockchain];
      await this.checkBalance(
        bridgeTrade.fromBlockchain,
        token.address,
        token.symbol,
        token.decimals,
        bridgeTrade.amount
      );
    }).pipe(
      mergeMap(() => {
        return this.bridgeProvider
          .createTrade(bridgeTrade, () => this.updateTransactionsList())
          .pipe(
            tap(() => this.updateTransactionsList()),
            catchError(err => {
              if (err.code === this.USER_REJECT_ERROR_CODE) {
                return throwError(new UserRejectError(this.translateService));
              }
              console.debug('Bridge trade error:', err);
              return throwError(err);
            })
          );
      }),
      catchError(err => {
        console.debug(err);
        return throwError(err);
      })
    );
  }

  public depositPolygonTradeAfterCheckpoint(
    burnTransactionHash: string,
    onTransactionHash: (hash: string) => void
  ): Observable<string> {
    try {
      this.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);
    } catch (err) {
      return throwError(err);
    }

    return this.ethereumPolygonBridgeProviderService
      .depositTradeAfterCheckpoint(burnTransactionHash, onTransactionHash, () =>
        this.updateTransactionsList()
      )
      .pipe(
        tap(() => this.updateTransactionsList()),
        catchError(err => {
          if (err.code === this.USER_REJECT_ERROR_CODE) {
            return throwError(new UserRejectError(this.translateService));
          }
          console.debug('Bridge trade from Polygon to Eth error', err);
          return throwError(err);
        })
      );
  }

  public async updateTransactionsList(): Promise<void> {
    if (this.authService.user === null) {
      this._transactions.next(List([]));
      return;
    }

    const userAddress = this.authService.user?.address;
    if (this._swapTokens.size && userAddress) {
      const transactionsApi = await this.bridgeApiService.getTransactions(userAddress);

      const transactions = transactionsApi.map(transaction => {
        const { fromBlockchain, toBlockchain } = transaction;
        let { fromSymbol, toSymbol } = transaction;

        if (
          fromBlockchain === BLOCKCHAIN_NAME.POLYGON ||
          toBlockchain === BLOCKCHAIN_NAME.POLYGON
        ) {
          if (!this._isTestingMode) {
            fromSymbol = this._swapTokens
              .filter(token => token.blockchain === fromBlockchain)
              .find(token => token.address.toLowerCase() === fromSymbol.toLowerCase())?.symbol;
            toSymbol = this._swapTokens
              .filter(token => token.blockchain === toBlockchain)
              .find(token => token.address.toLowerCase() === toSymbol.toLowerCase())?.symbol;
          } else {
            const testBridgeToken = bridgeTestTokens[BLOCKCHAIN_NAME.POLYGON].find(
              token =>
                token.blockchainToken[fromBlockchain].address.toLowerCase() ===
                transaction.fromSymbol.toLowerCase()
            );
            fromSymbol = testBridgeToken?.blockchainToken[fromBlockchain].symbol;
            toSymbol = testBridgeToken?.blockchainToken[toBlockchain].symbol;
          }
        }

        return {
          ...transaction,
          fromSymbol,
          toSymbol
        };
      });

      this._transactions.next(List(transactions));
    }
  }
}
