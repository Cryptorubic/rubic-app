import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CalculatedTradesAmounts } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/calculated-trades-amounts';
import { animate, style, transition, trigger } from '@angular/animations';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { fakeProviders } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-counter/constants/fake-providers';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';

@Component({
  selector: 'app-trades-counter',
  templateUrl: './trades-counter.component.html',
  styleUrls: ['./trades-counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('600ms 1500ms', style({ opacity: 0 }))])
    ])
  ]
})
export class TradesCounterComponent {
  private _calculatedValue: CalculatedTradesAmounts;

  public showData$ = this.crossChainFormService.calculatedTradesAmounts$.pipe(
    map(info => info?.total && info.total < info.calculated)
  );

  // @todo CHECK
  public readonly fakeProvider$ = timer(0, 1000).pipe(
    map(index => {
      console.log(index);
      return fakeProviders[index % fakeProviders.length];
    })
  );

  public get calculatedProvider(): CalculatedTradesAmounts {
    return this._calculatedValue;
  }

  public get isBestRouteFound(): boolean {
    const { tradeStatus } = this.crossChainFormService;
    return (
      tradeStatus === TRADE_STATUS.READY_TO_APPROVE || tradeStatus === TRADE_STATUS.READY_TO_SWAP
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainFormService: CrossChainFormService
  ) {}
}
