import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2
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
export class InputNumberComponent implements OnInit, AfterViewInit {
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

  private inputEl: HTMLInputElement;

  public readonly inputControl = new FormControl<number>(this._value, { validators: [] });

  constructor(private readonly elRef: ElementRef, private readonly renderer: Renderer2) {}

  ngOnInit(): void {
    this.inputControl.setValidators([Validators.min(this.min), Validators.max(this.max)]);
  }

  ngAfterViewInit(): void {
    this.inputEl = this.elRef.nativeElement.querySelector('.input-control') as HTMLInputElement;
    this.setStyles();
  }

  public onKeyDown(e: KeyboardEvent): void {
    if (/^[eE+-]$/.test(e.key)) {
      e.preventDefault();
    }
    if (/[0-9\.,]/.test(e.key) && this.inputEl.value.length >= 10) {
      e.preventDefault();
      return;
    }
  }

  public emitValue(): void {
    if (this.inputControl.value === this.prevValue) return;

    if (new BigNumber(this.inputControl.value).lt(this.min)) {
      this.inputControl.setValue(this.min);
    } else if (new BigNumber(this.inputControl.value).gt(this.max)) {
      this.inputControl.setValue(this.max);
    }

    this.prettify();
    this.setStyles();

    this.inputChanged.emit(this.inputControl.value);
    this.prevValue = this.inputControl.value;
  }

  public setStyles(): void {
    const span = this.elRef.nativeElement.querySelector('.input-suffix') as HTMLSpanElement;
    if (!this.inputEl || !span) return;

    if (this.inputEl.value.length > 3) {
      this.renderer.setStyle(this.inputEl, 'flex', '0 0 70%');
      this.renderer.setStyle(span, 'flex', '0 0 30%');
    } else {
      this.renderer.setStyle(this.inputEl, 'flex', '0 0 50%');
      this.renderer.setStyle(span, 'flex', '0 0 50%');
    }
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
