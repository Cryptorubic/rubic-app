import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-instant-trades-form-options',
  templateUrl: './instant-trades-form-options.component.html',
  styleUrls: ['./instant-trades-form-options.component.scss']
})
export class InstantTradesFormOptionsComponent {
  @Input() public slippagePercent: string;

  @Output() private slippagePercentChange = new EventEmitter<string>();

  @Output() private areAdvancedOptionsValid = new EventEmitter<boolean>();

  @ViewChild('slippagePercentModel') slippagePercentModel: NgModel;

  public get slippagePercentAsNumber(): number {
    return parseFloat(this.slippagePercent);
  }

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
