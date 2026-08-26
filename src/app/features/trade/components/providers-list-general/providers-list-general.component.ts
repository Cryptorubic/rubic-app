import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiScrollbar } from '@taiga-ui/core';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output,
  ViewChild,
  DestroyRef,
  inject,
  AfterViewInit,
  OnInit
} from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { animate, style, transition, trigger } from '@angular/animations';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { HeaderStore } from '@core/header/services/header.store';
import { ModalService } from '@core/modals/services/modal.service';
import { CalculationStatus } from '@features/trade/models/calculation-status';
import { BehaviorSubject, fromEvent, interval, map } from 'rxjs';
import { debounceTime, switchMap, takeWhile, tap } from 'rxjs/operators';
import { CALCULATION_TIMEOUT_MS } from '../../constants/calculation';
import { SwapsFormService } from '../../services/swaps-form/swaps-form.service';
import { ProviderHintService } from '../../services/provider-hint/provider-hint.service';
import { ON_CHAIN_LONG_TIMEOUT_CHAINS } from '../../services/on-chain/constants/long-timeout-chains';
import { CCR_LONG_TIMEOUT_CHAINS } from '../../services/cross-chain/ccr-long-timeout-chains';
import { AlternativeRoutesService } from '../../services/alternative-route-api-service/alternative-routes.service';
import { AlternativeRoute } from '../../services/alternative-route-api-service/models/alternative-route';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { isPrivateTrade } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-private-trade';
import { getVisibleProviderStates } from '@features/trade/utils/get-visible-provider-states';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';

@Component({
  standalone: false,
  selector: 'app-providers-list-general',
  templateUrl: './providers-list-general.component.html',
  styleUrls: ['./providers-list-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProviderHintService],
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
export class ProvidersListGeneralComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) states: TradeState[] = [];

  @Input({ required: true }) selectedTradeType: TradeProvider;

  @Input({ required: true }) showCalculation: boolean;

  @Input({ required: true }) set calculationStatus(value: CalculationStatus) {
    this._calculationStatus = value;
    if (value.calculationProgress.current === 0 && value.calculationProgress.total === 1) {
      this._triggerCalculation$.next();
    }
  }

  @ViewChild('tuiScrollBar') scrollBarElement: TuiScrollbar;

  get visibleStates(): TradeState[] {
    return getVisibleProviderStates(
      this.states,
      this.privateOnly,
      this.calculationStatus?.calculationProgress,
      this.swapsStateService.lastBestPrivateTradeType
    );
  }

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

  @Output() readonly selectTrade = new EventEmitter<{
    tradeType: TradeProvider;
    automaticSelection: boolean;
  }>();

  public privateOnly = this.queryParamsService.queryParams?.privateOnly === 'true';

  public readonly isMobile = this.headerStore.isMobile;

  public readonly alternativeRoutes$ = this.alternativeRoutesService.getAlternativeRoutes();

  public readonly isTransferMode$ = this.formsTogglerService.isTransferMode$;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    @Inject(Injector) private readonly injector: Injector,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore,
    private readonly swapsFormService: SwapsFormService,
    private readonly providerHintService: ProviderHintService,
    private readonly alternativeRoutesService: AlternativeRoutesService,
    private readonly swapsStateService: SwapsStateService,
    private readonly queryParamsService: QueryParamsService,
    private readonly formsTogglerService: FormsTogglerService
  ) {}

  ngOnInit(): void {
    this.isTransferMode$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(isTransferMode => {
      this.onPrivateOnlyChange(isTransferMode);
    });
  }

  public onPrivateOnlyChange(value: boolean): void {
    this.privateOnly = value;
    this.queryParamsService.patchQueryParams({
      privateOnly: value.toString()
    });

    const tradeType = this.getTradeTypeForPrivateOnly(value);
    if (tradeType) {
      this.handleTradeSelection(tradeType, true);
    }
  }

  private getTradeTypeForPrivateOnly(privateOnly: boolean): TradeProvider | null {
    const tradesWithQuote = this.states.filter(state => state.trade);

    if (privateOnly) {
      return tradesWithQuote.find(isPrivateTrade)?.tradeType ?? null;
    }

    return (
      tradesWithQuote.find(state => !isPrivateTrade(state))?.tradeType ??
      tradesWithQuote.find(isPrivateTrade)?.tradeType ??
      null
    );
  }

  public handleTradeSelection(tradeType: TradeProvider, automaticSelection = false): void {
    this.selectTrade.emit({ tradeType, automaticSelection });
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

  public getMobileStates(states: TradeState[]): TradeState[] {
    if (this.privateOnly) {
      return [states[0]];
    }

    return states.slice(0, states.some(state => isPrivateTrade(state)) ? 2 : 1);
  }

  public openOtherProvidersList(): void {
    this.modalService
      .openOtherProvidersList(
        this.visibleStates,
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
      fromEvent((this.scrollBarElement as RubicAny).browserScrollRef.nativeElement, 'scroll')
        .pipe(
          tap(() => this.hideProviderHintOnScroll(true)),
          debounceTime(500),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => this.hideProviderHintOnScroll(false));
    }
  }

  public hideProviderHintOnScroll(isScrollStart: boolean): void {
    this.providerHintService.setHintVisibility(isScrollStart);
  }
}
