import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { CalculatedProvider } from 'src/app/features/swaps/features/cross-chain/models/calculated-provider';
import { animate, style, transition, trigger } from '@angular/animations';
import { interval, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { fakeProviders } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-counter/constants/fake-providers';

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
  @Input() set calculatedProvider(value: CalculatedProvider) {
    this._calculatedValue = value;
    this.showData = value?.total !== undefined;
    this.hasTrade = value?.hasBestTrade !== undefined;

    if (value?.current && value?.total && value.current === value.total) {
      const timeout = 1500;
      setTimeout(() => {
        this.showData = false;
        this.cdr.detectChanges();
      }, timeout);
    }
  }

  private _calculatedValue: CalculatedProvider;

  public showData = false;

  public hasTrade = false;

  public readonly provider$ = interval(1000).pipe(
    map(index => fakeProviders[index % fakeProviders.length]),
    takeUntil(of(this.showData))
  );

  public get calculatedProvider(): CalculatedProvider {
    return this._calculatedValue;
  }

  constructor(private readonly cdr: ChangeDetectorRef) {}
}
