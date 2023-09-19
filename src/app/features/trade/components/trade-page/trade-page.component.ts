import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ModalService } from '@core/modals/services/modal.service';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import BigNumber from 'bignumber.js';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { DOCUMENT } from '@angular/common';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { Asset } from '@features/swaps/shared/models/form/asset';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { combineLatestWith } from 'rxjs';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';

@Component({
  selector: 'app-trade-page',
  templateUrl: './trade-page.component.html',
  styleUrls: ['./trade-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-25%)', opacity: 0.5 }),
        animate('0.2s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 0.5, width: '360px' }),
        animate('0.2s ease-in', style({ transform: 'translateX(-25%)', opacity: 0, width: 0 }))
      ])
    ]),
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
export class TradePageComponent {
  public readonly formContent$ = this.tradePageService.formContent$;

  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly fromAmount$ = this.swapFormService.fromAmount$;

  public readonly toAmount$ = this.swapFormService.toAmount$;

  public isExpanded = false;

  public readonly providers$ = this.swapsState.tradesStore$.pipe(
    map(providers => providers.filter(provider => provider.trade))
  );

  public readonly showProviders$ = this.providers$.pipe(map(providers => providers.length > 0));

  public readonly selectedTradeType$ = this.swapsState.tradeState$.pipe(map(el => el.tradeType));

  private selectedAsset: TokenAmount;

  // @ts-ignore
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
  // this.settingsService.crossChainRoutingValueChanges.pipe(
  //   startWith(this.settingsService.crossChainRoutingValue),
  //   map(settings => settings.showReceiverAddress)
  // );

  constructor(
    private readonly modalService: ModalService,
    private readonly swapFormService: SwapsFormService,
    private readonly swapsState: SwapsStateService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly swapFormQueryService: SwapFormQueryService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly tradePageService: TradePageService,
    private readonly settingsService: SettingsService
  ) {}

  public handleTokenSelect(formType: FormType, asset: Asset): void {
    const token = asset as TokenAmount;
    if (token) {
      this.selectedAsset = token;
      const inputElement = this.document.getElementById('token-amount-input-element');
      const isFromAmountEmpty = !this.swapFormService.inputValue.fromAmount?.isFinite();

      if (inputElement && isFromAmountEmpty) {
        setTimeout(() => {
          inputElement.focus();
        }, 0);
      }

      if (formType === 'from') {
        this.swapFormService.inputControl.patchValue({
          fromBlockchain: token.blockchain,
          fromToken: token
        });
      } else {
        this.swapFormService.inputControl.patchValue({
          toToken: token,
          toBlockchain: token.blockchain
        });
      }
    }
    this.tradePageService.setState('form');
  }

  public openTokensSelect(formType: FormType): void {
    this.tradePageService.setState(formType === 'from' ? 'fromSelector' : 'toSelector');
  }

  public updateInputValue(formattedAmount: BigNumber): void {
    if (!formattedAmount?.isNaN()) {
      this.swapFormService.inputControl.patchValue({
        fromAmount: new BigNumber(formattedAmount)
      });
    }
  }

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    await this.swapsState.selectTrade(tradeType);
    this.getSwapPreview();
  }

  public getSwapPreview(): void {
    this.tradePageService.setState('preview');
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
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
}
