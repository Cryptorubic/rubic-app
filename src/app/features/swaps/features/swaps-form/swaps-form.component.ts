import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapsFormService } from '@features/swaps/core/services/swaps-form-service/swaps-form.service';
import { combineLatest, Observable } from 'rxjs';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { BlockchainName, BLOCKCHAIN_NAME, BlockchainsInfo } from 'rubic-sdk';
import { debounceTime, distinctUntilChanged, map, takeUntil, withLatestFrom } from 'rxjs/operators';
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
import { SwapFormInput } from '@features/swaps/core/services/swaps-form-service/models/swap-form-controls';
import { isMinimalToken } from '@shared/utils/is-token';
import { FromAssetType } from '@features/swaps/shared/models/form/asset';
import { RubicError } from '@core/errors/models/rubic-error';

type TokenType = 'from' | 'to';

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
export class SwapsFormComponent implements OnInit, OnDestroy {
  public isLoading = true;

  public tradeStatus: TRADE_STATUS;

  public allowRefresh: boolean = true;

  private _supportedTokens: List<TokenAmount>;

  private _supportedFavoriteTokens: List<TokenAmount>;

  public availableTokens: AvailableTokens;

  public availableFavoriteTokens: AvailableTokens;

  public fromAssetType: FromAssetType;

  public toBlockchain: BlockchainName;

  public swapType: SWAP_PROVIDER_TYPE;

  public isMobile$: Observable<boolean>;

  public currentInstantTradeInfo: InstantTradeInfo;

  public readonly backgroundColor = this.queryParams.backgroundColor;

  public readonly isFormFilled$ = this.swapsFormService.isFilled$;

  public get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  public get isCrossChainRouting(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
  }

  public readonly getCurrentUser$ = this.authService.currentUser$;

  constructor(
    private readonly swapsService: SwapsService,
    public readonly swapsFormService: SwapsFormService,
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
    this.isMobile$ = this.headerStore.getMobileDisplayStatus();
  }

  ngOnInit(): void {
    this.subscribeOnTokens();

    this.swapsService.swapMode$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(swapMode => {
        this.swapType = swapMode;
      });

    this.swapsFormService.inputValue$.pipe(takeUntil(this.destroy$)).subscribe(form => {
      if (
        (this.fromAssetType !== BLOCKCHAIN_NAME.SOLANA &&
          form.fromAssetType === BLOCKCHAIN_NAME.SOLANA) ||
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
    combineLatest([this.swapsService.availableTokens$, this.swapsService.availableFavoriteTokens$])
      .pipe(debounceTime(0), takeUntil(this.destroy$))
      .subscribe(tokensChangesTuple => this.handleTokensChange(tokensChangesTuple));
  }

  /**
   * Handle changes in tokens and bridge pairs lists.
   * @param supportedTokens List of supported tokens.
   */
  private handleTokensChange([supportedTokens, supportedFavoriteTokens]: [
    List<TokenAmount>,
    List<TokenAmount>
  ]): void {
    this.isLoading = true;
    if (!supportedTokens) {
      return;
    }

    this._supportedTokens = supportedTokens;
    this._supportedFavoriteTokens = supportedFavoriteTokens;

    this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this), 'default');
    this.callFunctionWithTokenTypes(this.setAvailableTokens.bind(this), 'favorite');

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private setFormValues(form: SwapFormInput): void {
    this.fromAssetType = form.fromAssetType;
    this.toBlockchain = form.toBlockchain;

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
    const oppositeTokenKey = tokenType === 'from' ? 'toToken' : 'fromAsset';
    const oppositeAsset = this.swapsFormService.inputValue[oppositeTokenKey];
    const oppositeToken = isMinimalToken(oppositeAsset) ? oppositeAsset : null;

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

  public async revert(): Promise<void> {
    const { fromAssetType, toBlockchain, fromAsset, toToken } = this.swapsFormService.inputValue;
    if (!BlockchainsInfo.isBlockchainName(fromAssetType) || !isMinimalToken(fromAsset)) {
      return;
    }
    const { toAmount } = this.swapsFormService.outputValue;

    const revertData = {
      fromAssetType: toBlockchain,
      fromAsset: toToken,
      toToken: fromAsset,
      toBlockchain: fromAssetType,
      ...(toAmount?.gt(0) && { fromAmount: toAmount })
    };
    this.swapsFormService.form.patchValue({
      input: revertData,
      output: { toAmount: new BigNumber(NaN) }
    });
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

    this.swapsFormService.inputValue$
      .pipe(
        map(form => [form?.fromAsset?.symbol || null, form?.toToken?.symbol || null]),
        distinctUntilChanged(compareObjects),
        withLatestFrom(this.swapsService.swapMode$),
        takeUntil(this.destroy$)
      )
      .subscribe(([[fromToken, toToken], swapMode]: [[string, string], SWAP_PROVIDER_TYPE]) => {
        if (
          swapMode !== SWAP_PROVIDER_TYPE.INSTANT_TRADE ||
          swapMode !== SWAP_PROVIDER_TYPE.INSTANT_TRADE
        ) {
          return;
        }

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

  ngOnDestroy(): void {
    this.settingsService.saveSettingsToLocalStorage();
  }

  public getFromBlockchain(): BlockchainName {
    if (this.fromAssetType === 'fiat') {
      throw new RubicError('From asset type is fiat');
    }
    return this.fromAssetType;
  }
}
