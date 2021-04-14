import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { List } from 'immutable';
import { catchError, first, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { Web3PrivateService } from '../../../core/services/blockchain/web3-private-service/web3-private.service';
import { BridgeToken } from '../models/BridgeToken';
import { TokensService } from '../../../core/services/backend/tokens-service/tokens.service';
import SwapToken from '../../../shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '../../../core/services/use-testing-mode/use-testing-mode.service';
import { bridgeTestTokens } from '../../../../test/tokens/bridge-tokens';
import { BlockchainBridgeProvider } from './blockchain-bridge-provider/blockchain-bridge-provider';
import { BinanceBridgeProviderService } from './blockchain-bridge-provider/binance-bridge-provider/binance-bridge-provider.service';
import { RubicBridgeProviderService } from './blockchain-bridge-provider/binance-bridge-provider/rubic-bridge-provider/rubic-bridge-provider.service';
import { PolygonBridgeProviderService } from './blockchain-bridge-provider/polygon-bridge-provider/polygon-bridge-provider.service';
import { MetamaskError } from '../../../shared/models/errors/provider/MetamaskError';
import { AccountError } from '../../../shared/models/errors/provider/AccountError';
import { NetworkError } from '../../../shared/models/errors/provider/NetworkError';
import { BridgeTrade } from '../models/BridgeTrade';
import { BridgeTableTransaction } from '../models/BridgeTableTransaction';
import { BridgeApiService } from '../../../core/services/backend/bridge-api/bridge-api.service';
import { UserRejectError } from '../../../shared/models/errors/provider/UserRejectError';

@Injectable()
export class BridgeService implements OnDestroy {
  private readonly USER_REJECT_ERROR_CODE = 4001;

  private bridgeProvider: BlockchainBridgeProvider;

  private selectedBlockchain: BLOCKCHAIN_NAME;

  private _tokens: BehaviorSubject<List<BridgeToken>> = new BehaviorSubject(List([]));

  public readonly tokens: Observable<List<BridgeToken>> = this._tokens.asObservable();

  private _swapTokens: List<SwapToken> = List([]);

  private _swapTokensSubscription$: Subscription;

  private _blockchainTokens = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: List([]),
    [BLOCKCHAIN_NAME.POLYGON]: List([])
  };

  private _transactions: BehaviorSubject<List<BridgeTableTransaction>> = new BehaviorSubject(null);

  public readonly transactions: Observable<
    List<BridgeTableTransaction>
  > = this._transactions.asObservable();

  private readonly transactionBlockchain = {
    ETH: BLOCKCHAIN_NAME.ETHEREUM,
    BSC: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    POL: BLOCKCHAIN_NAME.POLYGON
  };

  public walletAddress: Observable<string>;

  private _useTestingModeSubscription$: Subscription;

  private _isTestingMode: boolean;

  constructor(
    private bridgeApiService: BridgeApiService,
    private binanceBridgeProviderService: BinanceBridgeProviderService,
    private rubicBridgeProviderService: RubicBridgeProviderService,
    private polygonBridgeProviderService: PolygonBridgeProviderService,
    private tokensService: TokensService,
    private web3PrivateService: Web3PrivateService,
    private useTestingModeService: UseTestingModeService
  ) {
    this._swapTokensSubscription$ = this.tokensService.tokens.subscribe(swapTokens => {
      this._swapTokens = swapTokens;
      this.updateTransactionsList();
      this.setTokens();
    });

    this.walletAddress = web3PrivateService.onAddressChanges;

    this._useTestingModeSubscription$ = useTestingModeService.isTestingMode.subscribe(
      isTestingMode => {
        this._isTestingMode = isTestingMode;
        this.setTokens();
      }
    );
  }

  ngOnDestroy(): void {
    this._swapTokensSubscription$.unsubscribe();
    this._useTestingModeSubscription$.unsubscribe();
  }

  public async setNonEthereumBlockchain(nonEthereumBlockchain: BLOCKCHAIN_NAME): Promise<void> {
    this._tokens.next(List([]));

    this.selectedBlockchain = nonEthereumBlockchain;
    if (this.selectedBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
      this.bridgeProvider = this.binanceBridgeProviderService;
    } else {
      this.bridgeProvider = this.polygonBridgeProviderService;
    }

    this.setTokens();
  }

  private setTokens(): void {
    if (!this._swapTokens.size || !this.selectedBlockchain) {
      this._tokens.next(List([]));
      return;
    }
    if (this._isTestingMode) {
      this._tokens.next(bridgeTestTokens[this.selectedBlockchain]);
      return;
    }
    if (this._blockchainTokens[this.selectedBlockchain]?.size) {
      this._tokens.next(this._blockchainTokens[this.selectedBlockchain]);
      return;
    }

    this.bridgeProvider
      .getTokensList(this._swapTokens)
      .pipe(first())
      .subscribe(tokensList => {
        this._blockchainTokens[this.selectedBlockchain] = tokensList;
        this._tokens.next(this._blockchainTokens[this.selectedBlockchain]);
      });
  }

  public getFee(tokenEthAddress: string, toBlockchain: BLOCKCHAIN_NAME): Observable<number> {
    const token = this._tokens
      .getValue()
      .find(t => t.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address === tokenEthAddress);
    if (!token) {
      throw new Error('No such token');
    }
    return this.bridgeProvider.getFee(token, toBlockchain);
  }

  public checkIfEthereumGasPriceIsHigh(): Observable<boolean> {
    return this.rubicBridgeProviderService.checkIfEthereumGasPriceIsHigh();
  }

  private checkSettings(blockchain: BLOCKCHAIN_NAME): void {
    if (!this.web3PrivateService.isProviderActive) {
      throw new MetamaskError();
    }

    if (!this.web3PrivateService.address) {
      throw new AccountError();
    }

    if (
      this.web3PrivateService.network?.name !== blockchain &&
      (!this.useTestingModeService.isTestingMode.getValue() ||
        this.web3PrivateService.network?.name !== `${blockchain}_TESTNET`) &&
      (!this.useTestingModeService.isTestingMode.getValue() ||
        blockchain !== BLOCKCHAIN_NAME.ETHEREUM ||
        this.web3PrivateService.network?.name !== BLOCKCHAIN_NAME.GOERLI_TESTNET)
    ) {
      throw new NetworkError(blockchain);
    }
  }

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    try {
      this.checkSettings(bridgeTrade.fromBlockchain);
    } catch (err) {
      return throwError(err);
    }

    return this.bridgeProvider.createTrade(bridgeTrade, this.updateTransactionsList).pipe(
      tap(() => this.updateTransactionsList()),
      catchError(err => {
        if (err.code === this.USER_REJECT_ERROR_CODE) {
          return throwError(new UserRejectError());
        }
        console.debug(`Bridge trade error: ${err}`);
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

    return this.polygonBridgeProviderService
      .depositTradeAfterCheckpoint(
        burnTransactionHash,
        onTransactionHash,
        this.updateTransactionsList
      )
      .pipe(
        tap(() => this.updateTransactionsList()),
        catchError(err => {
          if (err.code === this.USER_REJECT_ERROR_CODE) {
            return throwError(new UserRejectError());
          }
          console.debug(`Bridge trade from Polygon to Eth error: ${err}`);
          return throwError(err);
        })
      );
  }

  public async updateTransactionsList(): Promise<void> {
    if (!this._swapTokens.size) {
      return;
    }

    if (this.web3PrivateService.address) {
      let transactionsArray = await this.bridgeApiService.getTransactions(
        this.web3PrivateService.address.toLowerCase()
      );

      transactionsArray = transactionsArray.map(transaction => ({
        ...transaction,
        fromNetwork: this.transactionBlockchain[transaction.fromNetwork],
        toNetwork: this.transactionBlockchain[transaction.toNetwork],
        actualFromAmount: new BigNumber(transaction.actualFromAmount).toFixed(),
        actualToAmount: new BigNumber(transaction.actualToAmount).toFixed(),
        opened: false
      }));

      transactionsArray = transactionsArray.map(transaction => {
        if (
          transaction.fromNetwork === BLOCKCHAIN_NAME.POLYGON ||
          transaction.toNetwork === BLOCKCHAIN_NAME.POLYGON
        ) {
          let ethSymbol: string;
          let polygonSymbol: string;
          if (!this._isTestingMode) {
            ethSymbol = this._swapTokens
              .filter(token => token.blockchain === BLOCKCHAIN_NAME.ETHEREUM)
              .find(token => token.address.toLowerCase() === transaction.ethSymbol.toLowerCase())
              .symbol;
            polygonSymbol = this._swapTokens
              .filter(token => token.blockchain === BLOCKCHAIN_NAME.POLYGON)
              .find(token => token.address.toLowerCase() === transaction.bscSymbol.toLowerCase())
              .symbol;
          } else {
            ethSymbol = bridgeTestTokens[BLOCKCHAIN_NAME.POLYGON].find(
              token =>
                token.blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].address.toLowerCase() ===
                transaction.ethSymbol.toLowerCase()
            ).blockchainToken[BLOCKCHAIN_NAME.ETHEREUM].symbol;
            polygonSymbol = bridgeTestTokens[BLOCKCHAIN_NAME.POLYGON].find(
              token =>
                token.blockchainToken[BLOCKCHAIN_NAME.POLYGON]?.address.toLowerCase() ===
                transaction.bscSymbol.toLowerCase()
            ).blockchainToken[BLOCKCHAIN_NAME.POLYGON].symbol;
          }

          return {
            ...transaction,
            ethSymbol,
            bscSymbol: polygonSymbol
          };
        }
        return transaction;
      });

      this._transactions.next(List(transactionsArray));
    }
  }
}
