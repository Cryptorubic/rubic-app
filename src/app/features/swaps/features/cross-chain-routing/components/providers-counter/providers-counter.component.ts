import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { CalculatedProvider } from '../../models/calculated-provider';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-providers-counter',
  templateUrl: './providers-counter.component.html',
  styleUrls: ['./providers-counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('600ms', style({ opacity: 0 }))])
    ])
  ]
})
export class ProvidersCounterComponent {
  private _calculatedValue: CalculatedProvider;

  public showData = false;

  public get calculatedProvider(): CalculatedProvider {
    return this._calculatedValue;
  }

  @Input() set calculatedProvider(value: CalculatedProvider) {
    this._calculatedValue = value;

    this.showData = Boolean(value?.total >= 2);

    if (value?.current && value?.total && value?.current === value?.total && value.total !== 0) {
      const timeout = 1500;
      setTimeout(() => {
        this.showData = false;
        this.cdr.detectChanges();
      }, timeout);
    }
  }

  constructor(private readonly cdr: ChangeDetectorRef) {}
}
