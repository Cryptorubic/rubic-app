import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { animate, style, transition, trigger } from '@angular/animations';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { HeaderStore } from '@core/header/services/header.store';
import { ModalService } from '@core/modals/services/modal.service';
import { CalculationStatus } from '@features/trade/models/calculation-status';
import { BehaviorSubject, fromEvent, interval, map } from 'rxjs';
import { debounceTime, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { CALCULATION_TIMEOUT_MS } from '../../constants/calculation';
import { SwapsFormService } from '../../services/swaps-form/swaps-form.service';
import { ProviderHintService } from '../../services/provider-hint/provider-hint.service';
import { TuiScrollbarComponent } from '@taiga-ui/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ON_CHAIN_LONG_TIMEOUT_CHAINS } from '../../services/on-chain/constants/long-timeout-chains';
import { CCR_LONG_TIMEOUT_CHAINS } from '../../services/cross-chain/ccr-long-timeout-chains';
import { AlternativeRoutesService } from '../../services/alternative-route-api-service/alternative-routes.service';
import { AlternativeRoute } from '../../services/alternative-route-api-service/models/alternative-route';

@Component({
  selector: 'app-providers-list-general',
  templateUrl: './providers-list-general.component.html',
  styleUrls: ['./providers-list-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService, ProviderHintService],
  animations: [
    trigger('progress', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('0.2s ease-out', style({ height: '53px', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '63px', opacity: 1 }),
        animate('0.2s ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class ProvidersListGeneralComponent {
  @Input({ required: true }) states: TradeState[] = [];

  @Input({ required: true }) selectedTradeType: TradeProvider;

  @Input({ required: true }) showCalculation: boolean;

  @Input({ required: true }) set calculationStatus(value: CalculationStatus) {
    this._calculationStatus = value;
    if (value.calculationProgress.current === 0 && value.calculationProgress.total === 1) {
      this._triggerCalculation$.next();
    }
  }

  @ViewChild('tuiScrollBar') scrollBarElement: TuiScrollbarComponent;

  private _calculationStatus: CalculationStatus;

  public get calculationStatus(): CalculationStatus {
    return this._calculationStatus;
  }

  private readonly _triggerCalculation$ = new BehaviorSubject<void>(null);

  private readonly ratio: number = 100;

  public readonly calculationProcess$ = this._triggerCalculation$.asObservable().pipe(
    switchMap(() => interval(this.ratio)),
    takeWhile(val => {
      if (this.isLongTimeoutChain()) {
        return val <= 30_000 / this.ratio;
      }
      return val <= CALCULATION_TIMEOUT_MS / this.ratio;
    }),
    map(time => this.convertIntervalValueToPercents(time))
  );

  public readonly calculationText$ = this.calculationProcess$.pipe(
    map(time => {
      return time <= 50
        ? 'Calculating providers...'
        : 'More providers can get close, but they are delaying the answer...';
    })
  );

  @Output() readonly selectTrade = new EventEmitter<TradeProvider>();

  public readonly isMobile = this.headerStore.isMobile;

  public readonly alternativeRoutes$ = this.alternativeRoutesService.getAlternativeRoutes();

  constructor(
    @Inject(Injector) private readonly injector: Injector,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore,
    private readonly swapsFormService: SwapsFormService,
    private readonly providerHintService: ProviderHintService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly alternativeRoutesService: AlternativeRoutesService
  ) {}

  public handleTradeSelection(tradeType: TradeProvider): void {
    this.selectTrade.emit(tradeType);
  }

  public handleRouteSelection(route: AlternativeRoute): void {
    this.swapsFormService.inputControl.patchValue({
      fromBlockchain: route.from.blockchain,
      fromToken: route.from,
      toBlockchain: route.to.blockchain,
      toToken: route.to,
      fromAmount: {
        visibleValue: route.amount.toFixed(),
        actualValue: route.amount
      }
    });

    this.alternativeRoutesService.setCurrentAlternativeRoute(route);
  }

  public openOtherProvidersList(): void {
    this.modalService
      .openOtherProvidersList(
        this.states,
        this.selectedTradeType,
        this.calculationStatus.calculationProgress,
        true,
        this.injector,
        this.calculationStatus.noRoutes
      )
      .subscribe(tradeType => {
        if (tradeType) {
          this.handleTradeSelection(tradeType);
        }
      });
  }

  private convertIntervalValueToPercents(val: number): number {
    if (this.isLongTimeoutChain()) {
      return val * ((100 * this.ratio) / 30_000);
    }
    return val * ((100 * this.ratio) / CALCULATION_TIMEOUT_MS);
  }

  private isLongTimeoutChain(): boolean {
    const { fromBlockchain, toBlockchain } = this.swapsFormService.inputValue;
    const isOnChain = fromBlockchain === toBlockchain;
    if (isOnChain) {
      return ON_CHAIN_LONG_TIMEOUT_CHAINS.includes(fromBlockchain);
    }
    return (
      CCR_LONG_TIMEOUT_CHAINS.includes(fromBlockchain) ||
      CCR_LONG_TIMEOUT_CHAINS.includes(toBlockchain)
    );
  }

  ngAfterViewInit(): void {
    // @TODO optimise scroll handler
    if (!this.isMobile) {
      fromEvent(this.scrollBarElement.browserScrollRef.nativeElement, 'scroll')
        .pipe(
          tap(() => this.hideProviderHintOnScroll(true)),
          debounceTime(500),
          takeUntil(this.destroy$)
        )
        .subscribe(() => this.hideProviderHintOnScroll(false));
    }
  }

  public hideProviderHintOnScroll(isScrollStart: boolean): void {
    this.providerHintService.setHintVisibility(isScrollStart);
  }
}
