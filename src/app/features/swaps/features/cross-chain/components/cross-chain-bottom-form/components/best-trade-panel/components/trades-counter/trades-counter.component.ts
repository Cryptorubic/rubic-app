import { ChangeDetectionStrategy, Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { iif, of, switchMap, timer } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { fakeProviders } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-counter/constants/fake-providers';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { getRandomNumber } from '@features/swaps/shared/utils/get-random-number';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';

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

  public readonly isFormFilled$ = this.swapFormService.isFilled$;

  public readonly displayCounter$ = this.isCalculating$.pipe(
    distinctUntilChanged(),
    switchMap(isCalculating =>
      iif(() => isCalculating, of(true), timer(2000).pipe(map(() => false)))
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
