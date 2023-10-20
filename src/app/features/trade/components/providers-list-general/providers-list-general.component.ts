import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output
} from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { animate, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, interval } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { HeaderStore } from '@core/header/services/header.store';
import { ModalService } from '@core/modals/services/modal.service';
import { CalculationProgress } from '@features/trade/models/calculationProgress';

@Component({
  selector: 'app-providers-list-general',
  templateUrl: './providers-list-general.component.html',
  styleUrls: ['./providers-list-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  @Input({ required: true }) set calculationProgress(value: CalculationProgress) {
    this._calculationProgress = value;
    if (value.current === 0) {
      this._triggerCalculation$.next();
    }
  }

  private _calculationProgress: CalculationProgress;

  public get calculationProgress(): CalculationProgress {
    return this._calculationProgress;
  }

  @Output() readonly selectTrade = new EventEmitter<TradeProvider>();

  private readonly _triggerCalculation$ = new BehaviorSubject<void>(null);

  public readonly calculationProcess$ = this._triggerCalculation$.asObservable().pipe(
    switchMap(() => interval(100)),
    takeWhile(el => el < 150),
    map(time => ({ total: 150, current: time }))
  );

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    @Inject(Injector) private readonly injector: Injector,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore
  ) {}

  public handleTradeSelection(tradeType: TradeProvider): void {
    this.selectTrade.emit(tradeType);
  }

  public openOtherProvidersList(): void {
    this.modalService
      .openOtherProvidersList(
        this.states,
        this.selectedTradeType,
        this.calculationProgress,
        true,
        this.injector
      )
      .subscribe(tradeType => {
        if (tradeType) {
          this.handleTradeSelection(tradeType);
        }
      });
  }
}
