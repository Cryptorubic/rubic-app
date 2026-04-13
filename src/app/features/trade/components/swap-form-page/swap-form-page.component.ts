import { ChangeDetectionStrategy, Component, Inject, Injector, Self } from '@angular/core';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { combineLatestWith, forkJoin, of } from 'rxjs';
import {
  distinctUntilChanged,
  first,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import BigNumber from 'bignumber.js';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormType } from '@features/trade/models/form-type';
import { HeaderStore } from '@core/header/services/header.store';
import { ModalService } from '@core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { SwapsStateService } from '../../services/swaps-state/swaps-state.service';
import { RefundService } from '../../services/refund-service/refund.service';
import { SolanaGaslessService } from '../../services/solana-gasless/solana-gasless.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { TargetNetworkAddressService } from '../../services/target-network-address-service/target-network-address.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';

@Component({
  selector: 'app-swap-form-page',
  templateUrl: './swap-form-page.component.html',
  styleUrls: ['./swap-form-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
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
  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly toBlockchain$ = this.swapFormService.toBlockchain$;

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
        const showReceiverAddress =
          crossChainReceiver.showReceiverAddress || onChainReceiver.showReceiverAddress;
        return showReceiverAddress;
      }
      return from.blockchain === to.blockchain
        ? onChainReceiver.showReceiverAddress
        : crossChainReceiver.showReceiverAddress;
    }),
    distinctUntilChanged()
  );

  public readonly receiverCtrl = this.targetNetworkAddressService.addressControl;

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly swapFormService: SwapsFormService,
    private readonly settingsService: SettingsService,
    private readonly headerStore: HeaderStore,
    private readonly modalService: ModalService,
    private readonly authService: AuthService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly swapsStateService: SwapsStateService,
    private readonly refundService: RefundService,
    private readonly solanaGaslessService: SolanaGaslessService,
    private readonly tokensFacade: TokensFacadeService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.swapFormService.inputValueDistinct$
      .pipe(takeUntil(this.destroy$))
      .subscribe(inputValue => {
        this.refundService.onSwapFormInputChanged(inputValue);
        this.solanaGaslessService.onSwapFormInputChanged(inputValue);
      });

    this.authService.currentUser$
      .pipe(
        distinctUntilChanged((prev, curr) => compareAddresses(prev?.address, curr?.address)),
        switchMap(() => {
          const srcToken = this.swapFormService.inputValue.fromToken;
          const dstToken = this.swapFormService.inputValue.toToken;
          const srcBalance$ = srcToken
            ? this.tokensFacade.getAndUpdateTokenBalance(srcToken)
            : of(new BigNumber(NaN));
          const dstBalance$ = dstToken
            ? this.tokensFacade.getAndUpdateTokenBalance(dstToken)
            : of(new BigNumber(NaN));
          return forkJoin([srcBalance$, dstBalance$]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(([srcBalance, dstBalance]) => {
        const srcToken = this.swapFormService.inputValue.fromToken;
        const dstToken = this.swapFormService.inputValue.toToken;
        this.swapFormService.inputControl.patchValue({
          fromToken: { ...srcToken, amount: srcBalance }
        });
        this.swapFormService.inputControl.patchValue({
          toToken: { ...dstToken, amount: dstBalance }
        });
      });
  }

  public openSelector(inputType: FormType, isMobile: boolean): void {
    if (isMobile) {
      this.modalService
        .openAssetsSelector(inputType, this.injector)
        .subscribe((selectedToken: AvailableTokenAmount) => {
          if (inputType === 'from') {
            this.swapFormService.inputControl.patchValue({
              fromBlockchain: selectedToken.blockchain,
              fromToken: selectedToken
            });
          } else {
            this.swapFormService.inputControl.patchValue({
              toToken: selectedToken,
              toBlockchain: selectedToken.blockchain
            });
          }
        });
    } else {
      this.tradePageService.setState(inputType === 'from' ? 'fromSelector' : 'toSelector');
    }
  }

  public updateInputValue(value: { visibleValue: string; actualValue: BigNumber }): void {
    const isValueCorrect = !value.actualValue?.isNaN();
    const oldValue = this.swapFormService.inputValue?.fromAmount?.actualValue;
    if (!oldValue || !oldValue.eq(value?.actualValue)) {
      this.swapFormService.inputControl.patchValue({
        fromAmount: isValueCorrect ? value : null
      });
    }
  }

  public async toggleReceiver(): Promise<void> {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    const settings =
      fromBlockchain === toBlockchain
        ? this.settingsService.instantTrade
        : this.settingsService.crossChainRouting;

    const oldValue = settings.controls.showReceiverAddress.value;
    settings.patchValue({ showReceiverAddress: !oldValue });
  }

  public async revert(): Promise<void> {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;

    this.swapsStateService.setCalculationProgress(0, 0);
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

  public handleMaxButton(): void {
    this.swapFormService.fromToken$
      .pipe(
        first(),
        tap(fromToken => {
          const token = this.tokensFacade.tokens.find(currentToken =>
            compareTokens(fromToken, currentToken)
          );

          if (token.amount) {
            this.swapFormService.inputControl.patchValue({
              fromAmount: {
                actualValue: token.amount,
                visibleValue: token.amount.toFixed()
              }
            });
          }
        })
      )
      .subscribe();
  }
}
