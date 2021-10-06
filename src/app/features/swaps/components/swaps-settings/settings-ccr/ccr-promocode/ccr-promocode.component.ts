import {
  Component,
  EventEmitter,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { PromoCode } from 'src/app/features/swaps/models/PromoCode';
import { PromoCodeApiService } from 'src/app/core/services/backend/promo-code-api/promo-code-api.service';
import { Subject } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ccr-promocode',
  templateUrl: './ccr-promocode.component.html',
  styleUrls: ['./ccr-promocode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CcrPromocodeComponent implements OnInit, OnChanges {
  @Input() ngModel: PromoCode | null = null;

  @Output() ngModelChange = new EventEmitter<PromoCode | null>();

  public promoCodeText: string;

  private debouncePromoCodeInput$ = new Subject<string>();

  constructor(
    private promoCodeApiService: PromoCodeApiService,
    private destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.debouncePromoCodeInput$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        switchMap(promoCodeText => this.promoCodeApiService.validatePromoCode(promoCodeText))
      )
      .subscribe(promoCode => {
        this.ngModel = promoCode;
        this.ngModelChange.emit(promoCode);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.ngModel?.previousValue !== changes.ngModel?.currentValue &&
      changes.ngModel.currentValue
    ) {
      this.promoCodeText = changes.ngModel.currentValue?.text || '';
    }
  }

  public onPromoCodeTextChanges(text: string): void {
    this.debouncePromoCodeInput$.next(text);
  }
}
