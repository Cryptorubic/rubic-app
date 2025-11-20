import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ShortenAmountPipe } from '@app/shared/pipes/shorten-amount.pipe';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputNumberComponent implements OnInit {
  /**
   * px, %, vh, vw
   */
  @Input() width: string = '75px';

  @Input() height: string = '32px';

  @Input() suffix: string = '';

  @Input() integerLen: number = 2;

  @Input() decimalsLen: number = 2;

  @Input() min: number = 0;

  @Input() max: number = 50;

  @Input({ required: true }) name: string;

  @Input() set value(newValue: number) {
    this.inputControl.setValue(newValue);
  }

  @Output() inputChanged: EventEmitter<number> = new EventEmitter();

  private _value: number = 0;

  private prevValue: number = this._value;

  public readonly inputControl = new FormControl<number>(this._value, { validators: [] });

  ngOnInit(): void {
    this.inputControl.setValidators([Validators.min(this.min), Validators.max(this.max)]);
  }

  public emitValue(): void {
    if (this.inputControl.value === this.prevValue) return;

    if (this.inputControl.hasError('min')) {
      this.inputControl.setValue(this.min);
    } else if (this.inputControl.hasError('max')) {
      this.inputControl.setValue(this.max);
    }

    this.prettify();
    this.inputChanged.emit(this.inputControl.value);
    this.prevValue = this.inputControl.value;
  }

  private prettify(): void {
    const pureValue = new ShortenAmountPipe().transform(
      new BigNumber(this.inputControl.value).toFixed(),
      this.integerLen + this.decimalsLen,
      this.decimalsLen,
      false
    );
    this.inputControl.setValue(new BigNumber(pureValue).toNumber());
  }
}
