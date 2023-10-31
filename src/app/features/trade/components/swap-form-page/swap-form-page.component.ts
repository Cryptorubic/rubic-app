import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { combineLatestWith } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import BigNumber from 'bignumber.js';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { RefreshService } from '@features/trade/services/refresh-service/refresh.service';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { REFRESH_STATUS } from '@features/trade/models/refresh-status';
import { FormType } from '@features/trade/models/form-type';
import { HeaderStore } from '@core/header/services/header.store';
import { ModalService } from '@core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-swap-form-page',
  templateUrl: './swap-form-page.component.html',
  styleUrls: ['./swap-form-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('receiverAnimation', [
      transition(':enter', [
        style({ height: '0px', opacity: 0.5 }),
        animate('0.2s ease-out', style({ height: '56px', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '56px' }),
        animate('0.2s ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class SwapFormPageComponent {
  public readonly isRefreshRotating$ = this.refreshService.status$.pipe(
    map(status => status !== REFRESH_STATUS.STOPPED)
  );

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly fromAmount$ = this.swapFormService.fromAmount$;

  public readonly toAmount$ = this.swapFormService.toAmount$.pipe(
    map(amount => (amount ? { actualValue: amount, visibleValue: amount?.toFixed() } : null))
  );

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly displayTargetAddressInput$ = this.fromAsset$.pipe(
    combineLatestWith(
      this.toAsset$,
      this.settingsService.crossChainRoutingValueChanges.pipe(
        startWith(this.settingsService.crossChainRoutingValue)
      ),
      this.settingsService.instantTradeValueChanges.pipe(
        startWith(this.settingsService.instantTradeValue)
      )
    ),
    map(([from, to, crossChainReceiver, onChainReceiver]) => {
      if (!from || !to) {
        return crossChainReceiver.showReceiverAddress;
      }
      return from.blockchain === to.blockchain
        ? onChainReceiver.showReceiverAddress
        : crossChainReceiver.showReceiverAddress;
    }),
    distinctUntilChanged()
  );

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly swapFormService: SwapsFormService,
    private readonly settingsService: SettingsService,
    private readonly refreshService: RefreshService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly headerStore: HeaderStore,
    private readonly modalService: ModalService,
    private readonly authService: AuthService,
    @Inject(Injector) private readonly injector: Injector
  ) {
    this.swapFormService.fromBlockchain$.subscribe(blockchain => {
      if (blockchain) {
        this.tokensStoreService.startBalanceCalculating(blockchain);
      }
    });
    this.swapFormService.toBlockchain$.subscribe(blockchain => {
      if (blockchain) {
        this.tokensStoreService.startBalanceCalculating(blockchain);
      }
    });
  }

  public openTokensSelect(formType: FormType, isMobile: boolean): void {
    if (isMobile) {
      this.modalService.openAssetsSelector(formType, this.injector).subscribe();
    } else {
      this.tradePageService.setState(formType === 'from' ? 'fromSelector' : 'toSelector');
    }
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    const isValueCorrect = !value.actualValue?.isNaN();
    const oldValue = this.swapFormService.inputValue.fromAmount.actualValue;
    if (!oldValue.eq(value.actualValue)) {
      this.swapFormService.inputControl.patchValue({
        fromAmount: isValueCorrect ? value : null
      });
    }
  }

  public async toggleReceiver(): Promise<void> {
    const { fromToken, toToken } = this.swapFormService.inputValue;
    let settings = this.settingsService.crossChainRouting;
    if (fromToken && toToken) {
      // @ts-ignore
      settings =
        fromToken.blockchain === toToken.blockchain
          ? this.settingsService.instantTrade
          : this.settingsService.crossChainRouting;
    }
    const oldValue = settings.controls.showReceiverAddress.value;
    settings.patchValue({ showReceiverAddress: !oldValue });
  }

  public async revert(): Promise<void> {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;

    this.swapFormService.inputControl.patchValue({
      fromBlockchain: toBlockchain,
      fromToken: toToken,
      toToken: fromToken,
      toBlockchain: fromBlockchain,
      ...(toAmount?.gt(0) && {
        fromAmount: {
          visibleValue: toAmount.toFixed(),
          actualValue: toAmount
        }
      })
    });
    this.swapFormService.outputControl.patchValue({
      toAmount: null
    });
  }

  public refreshTrades(): void {
    this.refreshService.onButtonClick();
  }

  public handleMaxButton(): void {
    const token = this.swapFormService.inputValue.fromToken;
    this.swapFormService.inputControl.patchValue({
      fromAmount: {
        actualValue: token.amount,
        visibleValue: token.amount.toFixed()
      }
    });
  }
}
