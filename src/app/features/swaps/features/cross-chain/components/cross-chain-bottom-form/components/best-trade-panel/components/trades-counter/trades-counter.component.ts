import { ChangeDetectionStrategy, Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { iif, of, switchMap, timer, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { fakeProviders } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-counter/constants/fake-providers';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { getRandomNumber } from '@features/swaps/shared/utils/get-random-number';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { distinctObjectUntilChanged } from '@shared/utils/distinct-object-until-changed';

@Component({
  selector: 'app-trades-counter',
  templateUrl: './trades-counter.component.html',
  styleUrls: ['./trades-counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('600ms', style({ opacity: 0 }))])
    ])
  ]
})
export class TradesCounterComponent {
  public readonly isCalculating$ = this.crossChainFormService.isCalculating$;

  public readonly displayCounter$ = combineLatest([
    this.swapFormService.isFilled$,
    this.crossChainFormService.isCalculating$
  ]).pipe(
    distinctObjectUntilChanged(),
    switchMap(([isFilled, isCalculating]) => {
      if (!isFilled) {
        return of(false);
      }
      if (isCalculating) {
        // stops ':leave' animation and after 1ms begins ':enter'
        return timer(0, 1).pipe(
          map(value => value > 0),
          take(2)
        );
      }
      return of(true);
    })
  );

  public readonly displayText$ = this.isCalculating$.pipe(
    distinctUntilChanged(),
    switchMap(isCalculating =>
      iif(
        () => isCalculating,
        // starts after 1ms due to ':leave' animation stop (watch displayCounter$)
        timer(1).pipe(map(() => true)),
        timer(2000).pipe(map(() => false))
      )
    )
  );

  public readonly fakeProvider$ = timer(0, 1200).pipe(
    map(() => fakeProviders[getRandomNumber(fakeProviders.length)])
  );

  public get isBestRouteFound(): boolean {
    const { selectedTrade } = this.crossChainFormService;
    return (
      !selectedTrade?.error &&
      this.crossChainFormService.selectedTrade?.trade?.to.tokenAmount.isFinite()
    );
  }

  constructor(
    private readonly crossChainFormService: CrossChainFormService,
    private readonly swapFormService: SwapFormService
  ) {}
}
