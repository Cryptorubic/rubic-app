import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { combineLatestWith } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import BigNumber from 'bignumber.js';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';

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
  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly fromAmount$ = this.swapFormService.fromAmount$;

  public readonly toAmount$ = this.swapFormService.toAmount$;

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
    private swapsControllerService: SwapsControllerService
  ) {}

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
      ...(toAmount?.gt(0) && { fromAmount: toAmount })
    });
    this.swapFormService.outputControl.patchValue({
      toAmount: null
    });
  }
}
