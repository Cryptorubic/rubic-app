import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-instant-trades-form-options',
  templateUrl: './instant-trades-form-options.component.html',
  styleUrls: ['./instant-trades-form-options.component.scss']
})
export class InstantTradesFormOptionsComponent {
  @Input() public slippagePercent: number;

  @Output() private slippagePercentChange = new EventEmitter<number>();

  @Output() private areAdvancedOptionsValid = new EventEmitter<boolean>();

  @ViewChild('slippagePercentModel') slippagePercentModel: NgModel;

  constructor() {}

  public onSlippagePercentChange(percent: number): void {
    this.slippagePercentChange.emit(percent / 100);
    setTimeout(() => {
      this.areAdvancedOptionsValid.emit(
        this.slippagePercentModel.value && this.slippagePercentModel.valid
      );
    });
  }
}
