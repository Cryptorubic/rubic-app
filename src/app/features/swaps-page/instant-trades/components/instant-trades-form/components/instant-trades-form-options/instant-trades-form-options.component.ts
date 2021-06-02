import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-instant-trades-form-options',
  templateUrl: './instant-trades-form-options.component.html',
  styleUrls: ['./instant-trades-form-options.component.scss']
})
export class InstantTradesFormOptionsComponent {
  public readonly MIN_SLIPPAGE_VALUE = 0.01;

  public readonly MIN_RECOMMENDED_SLIPPAGE_VALUE = 0.05;

  public readonly MAX_RECOMMENDED_SLIPPAGE_VALUE = 1.5;

  public readonly MAX_SLIPPAGE_VALUE = 50;

  @Input() public slippagePercent: string;

  @Output() private slippagePercentChange = new EventEmitter<string>();

  @Output() private areAdvancedOptionsValid = new EventEmitter<boolean>();

  @ViewChild('slippagePercentModel') slippagePercentModel: NgModel;

  constructor() {}

  public onSlippagePercentChange(percent: string): void {
    this.slippagePercentChange.emit(percent);
    setTimeout(() => {
      this.areAdvancedOptionsValid.emit(
        this.slippagePercentModel.value && this.slippagePercentModel.valid
      );
    });
  }
}
