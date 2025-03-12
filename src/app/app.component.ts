import { AfterViewInit, Component, Inject, isDevMode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import { QueryParams } from '@core/services/query-params/models/query-params';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { catchError, first, map } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { IframeService } from '@core/services/iframe-service/iframe.service';
import { SpindlService } from './core/services/spindl-ads/spindl.service';
import { WalletConnectorService } from './core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TokensStoreService } from './core/services/tokens/tokens-store.service';
import { BalanceLoadingStateService } from './core/services/tokens/balance-loading-state.service';
import { AssetsSelectorStateService } from './features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { TOKEN_FILTERS } from './features/trade/components/assets-selector/models/token-filters';
import { TradePageService } from './features/trade/services/trade-page/trade-page.service';
import { BalanceLoadingAssetData } from './core/services/tokens/models/balance-loading-types';
import { TokensNetworkService } from './core/services/tokens/tokens-network.service';
import {
  BLOCKCHAIN_NAME,
  evmCommonCrossChainAbi,
  EvmWeb3Pure,
  gatewayRubicCrossChainAbi,
  Injector,
  nativeTokensList,
  OnChainProxyService,
  PriceTokenAmount,
  ProxyCrossChainEvmTrade,
  rubicProxyContractAddress,
  Web3Pure
} from 'rubic-sdk';
import { PUMP_ABI, PUMP_CONTRACT } from './pump-abi';
import { percentAddress } from './features/trade/services/proxy-fee-service/const/fee-type-address-mapping';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  public isBackendAvailable: boolean;

  public useLargeIframe = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly queryParamsService: QueryParamsService,
    @Inject(WINDOW) private window: RubicWindow,
    private readonly activatedRoute: ActivatedRoute,
    private readonly iframeService: IframeService,
    private readonly spindlService: SpindlService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly balanceLoadingStateService: BalanceLoadingStateService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly tradePageService: TradePageService,
    private readonly tokensNetworkService: TokensNetworkService
  ) {
    this.printTimestamp();
    this.setupLanguage();

    this.initApp();
    this.spindlService.initSpindlAds();
    this.subscribeOnWalletChanges();
    this.tokensNetworkService.setupSubscriptions();
  }

  ngAfterViewInit() {
    this.setupIframeSettings();

    setTimeout(() => {
      // this.buyToken();
      this.sellToken();
    }, 5_000);
  }

  private async sellToken(): Promise<void> {
    const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
      BLOCKCHAIN_NAME.AVALANCHE
    );

    const MEM_TOKEN_ADDR = '0xEc37C50Fd18B93Ab47578E58a952F25b35A0F63e';
    const memToken = new PriceTokenAmount({
      address: MEM_TOKEN_ADDR,
      blockchain: BLOCKCHAIN_NAME.AVALANCHE,
      decimals: 18,
      name: 'shrek',
      symbol: 'SHREK',
      price: new BigNumber(1),
      tokenAmount: new BigNumber(1_000_000)
    });

    // const proxyFeeInfo = await new OnChainProxyService().getFeeInfo(
    //   memToken,
    //   percentAddress.twoPercent
    // );

    // const proxyFee = new BigNumber(proxyFeeInfo?.fixedFeeToken.tokenAmount || '0');

    // const value = Web3Pure.toWei(proxyFee.plus('0'), memToken.decimals);

    const sellTokenEvmConfig = EvmWeb3Pure.encodeMethodCall(
      PUMP_CONTRACT,
      PUMP_ABI,
      'sellToken',
      [memToken.address, memToken.stringWeiAmount, '0'],
      '0'
    );

    try {
      // const receipt = await web3Private.sendTransaction(startViaRubicEvmConfig.to, {
      //   data: startViaRubicEvmConfig.data,
      //   value: startViaRubicEvmConfig.value,
      //   to: startViaRubicEvmConfig.to
      // });
      const receipt = await web3Private.sendTransaction(sellTokenEvmConfig.to, {
        data: sellTokenEvmConfig.data,
        value: sellTokenEvmConfig.value,
        to: sellTokenEvmConfig.to
      });

      console.log('%cMEM_Receipt ===> ', 'color: yellow; font-size: 20px;', receipt);
    } catch (err) {
      console.log('%cMEM_Error ===> ', 'color: yellow; font-size: 20px;', err);
    }
  }

  private async buyToken(): Promise<void> {
    const web3Private = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
      BLOCKCHAIN_NAME.AVALANCHE
    );

    const MEM_TOKEN_ADDR = '0xEc37C50Fd18B93Ab47578E58a952F25b35A0F63e';
    const avaxToken = await PriceTokenAmount.createFromToken({
      ...nativeTokensList.AVALANCHE,
      tokenAmount: new BigNumber(0.1)
    });

    const proxyFeeInfo = await new OnChainProxyService().getFeeInfo(
      avaxToken,
      percentAddress.twoPercent
    );
    // const fromWithoutFee = getFromWithoutFee(avaxToken, proxyFeeInfo.platformFee.percent);
    const proxyFee = new BigNumber(proxyFeeInfo?.fixedFeeToken.tokenAmount || '0');

    const value = Web3Pure.toWei(proxyFee.plus(avaxToken.tokenAmount), avaxToken.decimals);

    const buyTokenEvmConfig = EvmWeb3Pure.encodeMethodCall(
      PUMP_CONTRACT,
      PUMP_ABI,
      'buyToken',
      [MEM_TOKEN_ADDR, '0'],
      value
    );
    const selector = buyTokenEvmConfig.data.slice(0, 10);

    await ProxyCrossChainEvmTrade.checkDexWhiteList(
      BLOCKCHAIN_NAME.AVALANCHE,
      PUMP_CONTRACT,
      selector
    );

    const swapGenericMethodArgs = [
      EvmWeb3Pure.randomHex(32),
      percentAddress.twoPercent,
      '0x0000000000000000000000000000000000000000',
      this.walletConnectorService.address,
      '0',
      [
        [
          PUMP_CONTRACT,
          PUMP_CONTRACT,
          avaxToken.address,
          MEM_TOKEN_ADDR,
          Web3Pure.toWei(0.1, avaxToken.decimals),
          buyTokenEvmConfig.data,
          true
        ]
      ]
    ];

    const swapGenericEvmConfig = EvmWeb3Pure.encodeMethodCall(
      rubicProxyContractAddress[BLOCKCHAIN_NAME.AVALANCHE].router,
      evmCommonCrossChainAbi,
      'swapTokensGeneric',
      swapGenericMethodArgs,
      value
    );

    const sendingToken = avaxToken.isNative ? [] : [avaxToken.address];
    const sendingAmount = avaxToken.isNative ? [] : [avaxToken.stringWeiAmount];

    const startViaRubicEvmConfig = EvmWeb3Pure.encodeMethodCall(
      rubicProxyContractAddress[BLOCKCHAIN_NAME.AVALANCHE].gateway,
      gatewayRubicCrossChainAbi,
      'startViaRubic',
      [sendingToken, sendingAmount, swapGenericEvmConfig.data],
      value
    );

    try {
      const receipt = await web3Private.sendTransaction(startViaRubicEvmConfig.to, {
        data: startViaRubicEvmConfig.data,
        value: startViaRubicEvmConfig.value,
        to: startViaRubicEvmConfig.to
      });
      // const receipt = await web3Private.sendTransaction(buyTokenEvmConfig.to, {
      //   data: buyTokenEvmConfig.data,
      //   value: buyTokenEvmConfig.value,
      //   to: buyTokenEvmConfig.to
      // });

      console.log('%cPUMP_Receipt ===> ', 'color: yellow; font-size: 20px;', receipt);
    } catch (err) {
      console.log('%cPUMP_Error ===> ', 'color: yellow; font-size: 20px;', err);
    }
  }

  private subscribeOnWalletChanges(): void {
    this.walletConnectorService.addressChange$.subscribe(userAddress => {
      this.balanceLoadingStateService.resetBalanceCalculatingStatuses();
      this.tokensStoreService.startBalanceCalculating(this.assetsSelectorStateService.assetType);

      const allTokensAssetData: BalanceLoadingAssetData = {
        assetType: 'allChains',
        tokenFilter: TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
      };

      // load ALL_CHAINS_ALL_TOKENS assets in background if token's selector closed
      // and if ALL_CHAINS_ALL_TOKENS balances not loaded yet
      if (
        userAddress &&
        this.tradePageService.formContent === 'form' &&
        !this.balanceLoadingStateService.isBalanceCalculated(allTokensAssetData) &&
        this.assetsSelectorStateService.tokenFilter !== TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
      ) {
        this.tokensStoreService.startBalanceCalculating('allChains', {
          allChainsFilterToPatch: TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
        });
      }
    });
  }

  /**
   * Setups list of languages and current language.
   */
  private setupLanguage(): void {
    let userRegionLanguage = navigator.language?.split('-')[0];
    userRegionLanguage = isSupportedLanguage(userRegionLanguage) ? userRegionLanguage : 'en';
    const lng = this.cookieService.get('lng') || userRegionLanguage;
    this.translateService.setDefaultLang(lng);
    this.translateService.use(lng);
  }

  /**
   * Log current dev build timestamp.
   * @private
   */
  private printTimestamp(): void {
    if (isDevMode()) {
      // @ts-ignore
      import('@app/timestamp')
        .then(data => console.debug(`It's a development build, timestamp: ${data.timestamp}`))
        .catch(() => {
          console.debug('timestamp file is not found');
        });
    }
  }

  /**
   * Setups settings for app in iframe.
   */
  private setupIframeSettings(): void {
    if (this.iframeService.isIframe) {
      this.removeLiveChatInIframe();
    }
    this.queryParamsService.queryParams$
      .pipe(first(queryParams => Boolean(Object.keys(queryParams).length)))
      .subscribe(params => {
        this.useLargeIframe = params.useLargeIframe === 'true';
      });
  }

  private removeLiveChatInIframe(): void {
    const observer = new MutationObserver(() => {
      const liveChat = this.document.getElementById('chat-widget-container');
      if (liveChat) {
        liveChat.remove();
        observer.disconnect();
      }
    });
    observer.observe(this.document.body, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });
  }

  /**
   * Waits for all initializing observables to complete.
   */
  private initApp(): void {
    forkJoin([this.loadPlatformConfig(), this.initQueryParamsSubscription()]).subscribe(
      ([isBackendAvailable]) => {
        this.isBackendAvailable = isBackendAvailable;
        document.getElementById('loader')?.classList.add('disabled');
        setTimeout(() => document.getElementById('loader')?.remove(), 400); /* ios safari */
      }
    );
  }

  /**
   * Inits site query params subscription.
   */
  private initQueryParamsSubscription(): Observable<void> {
    const questionMarkIndex = this.window.location.href.indexOf('?');
    if (questionMarkIndex === -1 || questionMarkIndex === this.window.location.href.length - 1) {
      return of(null);
    }

    return this.activatedRoute.queryParams.pipe(
      first(queryParams => Boolean(Object.keys(queryParams).length)),
      map((queryParams: QueryParams) => {
        this.queryParamsService.setupQueryParams({
          ...queryParams,
          ...(queryParams?.from && { from: queryParams.from }),
          ...(queryParams?.to && { to: queryParams.to })
        });
        if (queryParams.hideUnusedUI) {
          this.setupUISettings(queryParams);
        }
      }),
      catchError(() => of(null))
    );
  }

  private setupUISettings(queryParams: QueryParams): void {
    const hideUI = queryParams.hideUnusedUI === 'true';

    if (hideUI) {
      this.document.body.classList.add('hide-unused-ui');
    }
  }

  /**
   * Loads platform config and checks is server active.
   */
  private loadPlatformConfig(): Observable<boolean> {
    return this.platformConfigurationService.loadPlatformConfig();
  }
}
