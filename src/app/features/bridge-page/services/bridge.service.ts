import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { List } from 'immutable';
import { first } from 'rxjs/operators';
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

@Injectable()
export class BridgeService implements OnDestroy {
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

  private _transactions: BehaviorSubject<List<BridgeTableTransaction>> = new BehaviorSubject(
    List([])
  );

  public readonly transactions: Observable<
    List<BridgeTableTransaction>
  > = this._transactions.asObservable();

  public walletAddress: Observable<string>;

  private _useTestingModeSubscription$: Subscription;

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
      const token = this._swapTokens.find(t => t.symbol === 'WQT');
      if (token) console.log('bridgeService', token);
      this.setTokens();
    });

    this.updateTransactionsList();

    this.walletAddress = web3PrivateService.onAddressChanges;

    this._useTestingModeSubscription$ = useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this._tokens.next(bridgeTestTokens);
      }
    });
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
    if (!this._swapTokens.size) {
      return;
    }

    if (this._blockchainTokens[this.selectedBlockchain].size) {
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

  public createTrade(bridgeTrade: BridgeTrade): Observable<string> {
    if (!this.web3PrivateService.isProviderActive) {
      return throwError(new MetamaskError());
    }

    if (!this.web3PrivateService.address) {
      return throwError(new AccountError());
    }

    const { fromBlockchain } = bridgeTrade;
    if (
      this.web3PrivateService.network?.name !== fromBlockchain &&
      (this.web3PrivateService.network?.name !== `${fromBlockchain}_TESTNET` ||
        !this.useTestingModeService.isTestingMode.getValue())
    ) {
      return throwError(new NetworkError(fromBlockchain));
    }

    const { onTransactionHash } = bridgeTrade;
    bridgeTrade.onTransactionHash = async hash => {
      if (onTransactionHash) {
        onTransactionHash(hash);
      }
      this.updateTransactionsList();
    };

    return this.bridgeProvider.createTrade(bridgeTrade);
  }

  public async updateTransactionsList(): Promise<void> {
    if (this.web3PrivateService.address) {
      const transactionsArray = await this.bridgeApiService.getTransactions(
        this.web3PrivateService.address.toLowerCase()
      );
      this._transactions.next(List(transactionsArray));
    }
  }
}
