import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '@shared/models/blockchain/ADDRESS_TYPE';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/BRIDGE_PROVIDER';
import { BridgeService } from '@features/bridge/services/bridge-service/bridge.service';
import { SwapInfoService } from '@features/swaps/components/swap-info/services/swap-info.service';

@Component({
  selector: 'app-bridge-swap-info',
  templateUrl: './bridge-swap-info.component.html',
  styleUrls: ['./bridge-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class BridgeSwapInfoComponent implements OnInit {
  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly Infinity = Infinity;

  private readonly averageTimeInProvider: Record<BRIDGE_PROVIDER, string>;

  public isFromPolygonToEth: boolean;

  private bridgeProvider: BRIDGE_PROVIDER;

  public fromTokenSymbol: string;

  public providerFee: number;

  public minAmount: number;

  public maxAmount: number;

  public get averageTime(): string {
    return this.averageTimeInProvider[this.bridgeProvider];
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly bridgeService: BridgeService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.averageTimeInProvider = {
      [BRIDGE_PROVIDER.SWAP_RBC]: '5m',
      [BRIDGE_PROVIDER.PANAMA]: '25m',
      [BRIDGE_PROVIDER.POLYGON]: '15m',
      [BRIDGE_PROVIDER.XDAI]: '15m',
      [BRIDGE_PROVIDER.EVO]: '15m'
    };
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.swapFormService.inputValueChanges
      .pipe(
        startWith(this.swapFormService.inputValue),
        switchMap(inputForm =>
          this.bridgeService.getBridgeTrade().pipe(
            first(),
            map(bridgeTrade => {
              this.bridgeProvider = bridgeTrade.provider;

              const token = bridgeTrade.token?.tokenByBlockchain[inputForm.fromBlockchain];
              this.minAmount = token?.minAmount;
              this.maxAmount = token?.maxAmount;

              return inputForm;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(inputForm => {
        this.isFromPolygonToEth =
          inputForm.fromBlockchain === BLOCKCHAIN_NAME.POLYGON &&
          inputForm.toBlockchain === BLOCKCHAIN_NAME.ETHEREUM;
        this.fromTokenSymbol = inputForm.fromToken?.symbol;

        this.cdr.markForCheck();
      });

    this.swapFormService.outputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(outputForm => {
      const { toAmount } = outputForm;
      if (!toAmount?.isFinite()) {
        this.swapInfoService.emitInfoCalculated();
        return;
      }

      const { fromAmount } = this.swapFormService.inputValue;
      this.providerFee = fromAmount.minus(toAmount).toNumber();

      this.swapInfoService.emitInfoCalculated();

      this.cdr.markForCheck();
    });
  }
}
