import {
  Component,
  EventEmitter,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnInit,
  OnChanges
} from '@angular/core';
import { PromoCode } from 'src/app/features/swaps/models/PromoCode';
import { PromoCodeApiService } from 'src/app/core/services/backend/promo-code-api/promo-code-api.service';
import { of, Subject } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { NgChanges } from 'src/app/shared/models/utility-types/NgChanges';

@Component({
  selector: 'app-ccr-promocode',
  templateUrl: './ccr-promocode.component.html',
  styleUrls: ['./ccr-promocode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CcrPromocodeComponent implements OnInit, OnChanges {
  @Input() promoCode: PromoCode | null = null;

  @Output() promoCodeChange = new EventEmitter<PromoCode | null>();

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
        debounceTime(400),
        switchMap(promoCodeText =>
          promoCodeText ? this.promoCodeApiService.validatePromoCode(promoCodeText) : of(null)
        )
      )
      .subscribe(promoCode => {
        this.promoCode = promoCode;
        this.promoCodeChange.emit(promoCode);
      });
  }

  ngOnChanges(changes: NgChanges<CcrPromocodeComponent>) {
    if (
      changes.promoCode?.previousValue !== changes.promoCode?.currentValue &&
      changes.promoCode.currentValue
    ) {
      this.promoCodeText = changes.promoCode.currentValue?.text || '';
    }
  }

  public onPromoCodeTextChanges(text: string): void {
    this.debouncePromoCodeInput$.next(text);
  }
}
