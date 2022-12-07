import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Self
} from '@angular/core';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { BlockchainName, BLOCKCHAIN_NAME, BlockchainsInfo } from 'rubic-sdk';
import { distinctUntilChanged, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { HeaderStore } from '@core/header/services/header.store';
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
import { SwapFormInput } from '@features/swaps/core/services/swap-form-service/models/swap-form-controls';
import { isMinimalToken } from '@shared/utils/is-token';
import { FromAssetType } from '@features/swaps/shared/models/form/asset';
import { RubicError } from '@core/errors/models/rubic-error';

@Component({
  selector: 'app-swap-form',
  templateUrl: './swap-form.component.html',
  styleUrls: ['./swap-form.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapFormComponent implements OnInit, OnDestroy {
  public tradeStatus: TRADE_STATUS;

  public allowRefresh: boolean = true;

  private fromAssetType: FromAssetType;

  public toBlockchain: BlockchainName;

  public swapType: SWAP_PROVIDER_TYPE;

  public currentInstantTradeInfo: InstantTradeInfo;

  public readonly backgroundColor = this.queryParamsService.backgroundColor;

  public readonly hideUnusedUI = this.queryParamsService.hideUnusedUI;

  public readonly isFormFilled$ = this.swapFormService.isFilled$;

  public readonly getCurrentUser$ = this.authService.currentUser$;

  public get isInstantTrade(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  }

  public get isCrossChainRouting(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
  }

  constructor(
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly translateService: TranslateService,
    private readonly notificationsService: NotificationsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.swapsService.swapMode$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(swapMode => {
        this.swapType = swapMode;
      });

    this.swapFormService.inputValue$.pipe(takeUntil(this.destroy$)).subscribe(form => {
      this.setFormValues(form);
    });

    this.watchGtmEvents();
  }

  ngOnDestroy(): void {
    this.settingsService.saveSettingsToLocalStorage();
  }

  private setFormValues(form: SwapFormInput): void {
    if (
      (this.fromAssetType !== BLOCKCHAIN_NAME.SOLANA &&
        form.fromAssetType === BLOCKCHAIN_NAME.SOLANA) ||
      (this.toBlockchain !== BLOCKCHAIN_NAME.SOLANA && form.toBlockchain === BLOCKCHAIN_NAME.SOLANA)
    ) {
      this.notifyBeta();
    }

    this.fromAssetType = form.fromAssetType;
    this.toBlockchain = form.toBlockchain;
  }

  public async revert(): Promise<void> {
    const { fromAssetType, toBlockchain, fromAsset, toToken } = this.swapFormService.inputValue;
    if (!BlockchainsInfo.isBlockchainName(fromAssetType) || !isMinimalToken(fromAsset)) {
      return;
    }
    const { toAmount } = this.swapFormService.outputValue;

    const revertData = {
      fromAssetType: toBlockchain,
      fromAsset: toToken,
      toToken: fromAsset,
      toBlockchain: fromAssetType,
      ...(toAmount?.gt(0) && { fromAmount: toAmount })
    };
    this.swapFormService.form.patchValue({
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

    this.swapFormService.inputValue$
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

  public getFromBlockchain(): BlockchainName {
    if (this.fromAssetType === 'fiat') {
      throw new RubicError('From asset type is fiat');
    }
    return this.fromAssetType;
  }
}
