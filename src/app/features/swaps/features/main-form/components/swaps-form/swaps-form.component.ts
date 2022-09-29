import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { BridgeTokenPairsByBlockchains } from '@features/swaps/features/bridge/models/bridge-token-pairs-by-blockchains';
import { combineLatest, Observable, Subject } from 'rxjs';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { SwapFormInput } from '@features/swaps/features/main-form/models/swap-form';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { REFRESH_BUTTON_STATUS } from '@shared/components/rubic-refresh-button/rubic-refresh-button.component';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import { HeaderStore } from '@core/header/services/header.store';
import { List } from 'immutable';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import BigNumber from 'bignumber.js';
import { TuiNotification } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { InstantTradeInfo } from '@features/swaps/features/instant-trade/models/instant-trade-info';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { compareObjects } from '@shared/utils/utils';
import { AuthService } from '@core/services/auth/auth.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';

type TokenType = 'from' | 'to';

export type SelectedToken = {
  [tokenType in TokenType]: TokenAmount;
};

type AvailableTokens = {
  [tokenType in TokenType]: AvailableTokenAmount[];
};

@Component({
  selector: 'app-swaps-form',
  templateUrl: './swaps-form.component.html',
  styleUrls: ['./swaps-form.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsFormComponent implements OnInit {
  public isLoading = true;

  public tradeStatus: TRADE_STATUS;

  public autoRefresh: boolean;

  public allowRefresh: boolean = true;

  public maxGasFee: BigNumber;

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public onRefreshTrade$ = new Subject<void>();

  private _supportedTokens: List<TokenAmount>;

  private _supportedFavoriteTokens: List<TokenAmount>;

  private _bridgeTokenPairsByBlockchainsArray: List<BridgeTokenPairsByBlockchains>;

  private _bridgeFavoriteTokenPairsByBlockchainsArray: List<BridgeTokenPairsByBlockchains>;

  public availableTokens: AvailableTokens;

  public availableFavoriteTokens: AvailableTokens;

  public selectedToken: SelectedToken;

  private _loadingStatus = REFRESH_BUTTON_STATUS.STOPPED;

  public fromBlockchain: BlockchainName;

  public toBlockchain: BlockchainName;

  public swapType: SWAP_PROVIDER_TYPE;

  public isMobile$: Observable<boolean>;

  public currentInstantTradeInfo: InstantTradeInfo;

  public get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  public get isBridge(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.BRIDGE;
  }

  public get isCrossChainRouting(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
  }

  public get allowTrade(): boolean {
    const form = this.swapFormService.inputValue;
    return Boolean(
      form.fromAmount?.gt(0) &&
        form.fromBlockchain &&
        form.toBlockchain &&
        form.fromToken &&
        form.toToken
    );
  }

  public get loadingStatus(): REFRESH_BUTTON_STATUS {
    return this._loadingStatus;
  }

  public set loadingStatus(status: REFRESH_BUTTON_STATUS) {
    this._loadingStatus = status;
    this.cdr.detectChanges();
  }

  public readonly getCurrentUser$ = this.authService.currentUser$;

  constructor(
    private readonly swapsService: SwapsService,
    public readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly destroy$: TuiDestroyService,
    private readonly translateService: TranslateService,
    private readonly notificationsService: NotificationsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly authService: AuthService,
    public readonly queryParams: QueryParamsService
  ) {
    this.availableTokens = {
      from: [],
      to: []
    };
    this.availableFavoriteTokens = {
      from: [],
      to: []
    };
    this.selectedToken = {
      from: undefined,
      to: undefined
    };
    this.isMobile$ = this.headerStore.getMobileDisplayStatus();
  }

  ngOnInit(): void {
    this.subscribeOnTokens();
    this.subscribeOnSettings();

    this.swapsService.swapMode$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(swapMode => {
        this.swapType = swapMode;
        if (this.authService?.user?.address) {
          this.autoRefresh =
            swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE
              ? this.settingsService.instantTradeValue.autoRefresh
              : this.settingsService.crossChainRoutingValue.autoRefresh;
        }
      });

    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        if (
          (this.fromBlockchain !== BLOCKCHAIN_NAME.SOLANA &&
            form.fromBlockchain === BLOCKCHAIN_NAME.SOLANA) ||
          (this.toBlockchain !== BLOCKCHAIN_NAME.SOLANA &&
            form.toBlockchain === BLOCKCHAIN_NAME.SOLANA)
        ) {
          this.notifyBeta();
        }
        this.setFormValues(form);
      });

    this.watchGtmEvents();
  }

  private subscribeOnTokens(): void {
    combineLatest([
      this.swapsService.availableTokens$,
      this.swapsService.availableFavoriteTokens$,
      this.swapsService.bridgeTokenPairsByBlockchainsArray$,
      this.swapsService.bridgeTokenPairsByBlockchainsFavoriteArray$
    ])
      .pipe(debounceTime(0), takeUntil(this.destroy$))
      .subscribe(tokensChangesTuple => this.handleTokensChange(tokensChangesTuple));
  }

  /**
   * Handle changes in tokens and bridge pairs lists.
   * @param supportedTokens List of supported tokens.
   * @param supportedFavoriteTokens List of supported favorite tokens.
   * @param bridgeTokenPairsByBlockchainsArray List of bridge tokens pairs.
   * @param bridgeFavoriteTokenPairsByBlockchainsArray List of bridge favorite tokens pairs.
   */
  private handleTokensChange([
    supportedTokens,
    supportedFavoriteTokens,
    bridgeTokenPairsByBlockchainsArray,
    bridgeFavoriteTokenPairsByBlockchainsArray
  ]: [
    List<TokenAmount>,
    List<TokenAmount>,
    List<BridgeTokenPairsByBlockchains>,
    List<BridgeTokenPairsByBlockchains>
  ]): void {
    this.isLoading = true;
    if (!supportedTokens) {
      return;
    }

    this._supportedTokens = supportedTokens;
    this._supportedFavoriteTokens = supportedFavoriteTokens;

    this._bridgeTokenPairsByBlockchainsArray = bridgeTokenPairsByBlockchainsArray;
    this._bridgeFavoriteTokenPairsByBlockchainsArray = bridgeFavoriteTokenPairsByBlockchainsArray;

    this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this), 'default');
    this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this), 'favorite');
    this.callFunctionWithTokenTypes(this.updateSelectedToken.bind(this), 'default');

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private subscribeOnSettings(): void {
    combineLatest([
      this.settingsService.instantTradeValueChanges.pipe(
        startWith(this.settingsService.instantTradeValue)
      ),
      this.settingsService.crossChainRoutingValueChanges.pipe(
        startWith(this.settingsService.crossChainRoutingValue)
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([instantTradeSettings, crossChainRoutingSettings]) => {
        if (this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
          this.autoRefresh = instantTradeSettings.autoRefresh;
        } else {
          this.autoRefresh = crossChainRoutingSettings.autoRefresh;
        }
      });
  }

  private setFormValues(form: SwapFormInput): void {
    this.fromBlockchain = form.fromBlockchain;
    this.toBlockchain = form.toBlockchain;
    this.selectedToken = {
      from: form.fromToken,
      to: form.toToken
    };

    if (this._supportedTokens) {
      this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this), 'default');
      this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this), 'favorite');
    }
  }

  private callFunctionWithTokenTypes(
    functionToCall: (tokenType: TokenType, tokenListType: 'default' | 'favorite') => void,
    tokenListType: 'default' | 'favorite'
  ): void {
    functionToCall('from', tokenListType);
    functionToCall('to', tokenListType);
  }

  private setAvailableTokens(tokenType: TokenType, tokenListType: 'default' | 'favorite'): void {
    const oppositeTokenKey = tokenType === 'from' ? 'toToken' : 'fromToken';
    const oppositeToken = this.swapFormService.inputValue[oppositeTokenKey];

    const availableTokens =
      tokenListType === 'default' ? this.availableTokens : this.availableFavoriteTokens;
    const supportedTokens =
      tokenListType === 'default' ? this._supportedTokens : this._supportedFavoriteTokens;

    if (!oppositeToken) {
      availableTokens[tokenType] = supportedTokens
        .map(supportedToken => ({
          ...supportedToken,
          available: true
        }))
        .toArray();
    } else {
      const tokens: AvailableTokenAmount[] = [];

      const checkIsEqualTokenAndPush = (supportedToken: TokenAmount): void => {
        tokens.push({
          ...supportedToken,
          available:
            supportedToken.blockchain !== oppositeToken.blockchain ||
            supportedToken.address.toLowerCase() !== oppositeToken.address.toLowerCase()
        });
      };

      supportedTokens.forEach(supportedToken => {
        checkIsEqualTokenAndPush(supportedToken);
      });

      availableTokens[tokenType] = tokens;
    }
  }

  private updateSelectedToken(tokenType: TokenType, tokenListType: 'default' | 'favorite'): void {
    const supportedTokens =
      tokenListType === 'default' ? this._supportedTokens : this._supportedFavoriteTokens;
    const token = this.selectedToken[tokenType];
    if (!token) {
      return;
    }

    const updatedToken = supportedTokens.find(
      supportedToken =>
        supportedToken.blockchain === token.blockchain &&
        supportedToken.address.toLowerCase() === token.address.toLowerCase()
    );

    if (
      updatedToken &&
      (((!updatedToken.amount?.isNaN() || !token.amount?.isNaN()) &&
        !updatedToken.amount?.eq(token.amount)) ||
        token.price !== updatedToken.price)
    ) {
      this.selectedToken[tokenType] = updatedToken;

      const formKey = tokenType === 'from' ? 'fromToken' : 'toToken';
      this.swapFormService.input.patchValue({
        [formKey]: this.selectedToken[tokenType]
      });
    }
  }

  public async revert(): Promise<void> {
    const formControls = this.swapFormService.commonTrade.controls;
    const { fromBlockchain, toBlockchain, fromToken, toToken } = formControls.input.value;
    const { toAmount } = formControls.output.value;
    const revertData = {
      toToken: fromToken,
      fromToken: toToken,
      toBlockchain: fromBlockchain,
      fromBlockchain: toBlockchain
    } as Partial<SwapFormInput>;
    if (toAmount && toAmount.gt(0)) {
      revertData.fromAmount = toAmount;
    }
    // Remove null control values.
    formControls.input.patchValue(revertData);
    formControls.output.patchValue({ toAmount: new BigNumber(NaN) });
  }

  private notifyBeta(): void {
    const message = this.translateService.instant('notifications.solanaBeta');
    this.notificationsService.show(message, {
      status: TuiNotification.Warning,
      autoClose: 10000
    });
  }

  private watchGtmEvents(): void {
    this.gtmService.fetchPassedFormSteps();
    this.gtmService.startGtmSession();

    this.swapFormService.inputValueChanges
      .pipe(
        map(form => [form?.fromToken?.symbol || null, form?.toToken?.symbol || null]),
        distinctUntilChanged(compareObjects),
        withLatestFrom(this.swapsService.swapMode$),
        takeUntil(this.destroy$)
      )
      .subscribe(([[fromToken, toToken], swapMode]: [[string, string], SWAP_PROVIDER_TYPE]) => {
        if (!this.gtmService.isGtmSessionActive) {
          this.gtmService.clearPassedFormSteps();
        }

        if (this.gtmService.needTrackFormEventsNow) {
          if (fromToken) {
            this.gtmService.updateFormStep(swapMode, 'token1');
          }

          if (toToken) {
            this.gtmService.updateFormStep(swapMode, 'token2');
          }
        } else {
          this.gtmService.needTrackFormEventsNow = true;
        }
      });
  }

  public onRefresh(): void {
    this.onRefreshTrade$.next();
  }
}
