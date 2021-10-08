import {
  Component,
  EventEmitter,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnInit,
  OnChanges,
  TemplateRef,
  ViewChildren,
  QueryList,
  ChangeDetectorRef
} from '@angular/core';
import { PromoCode } from 'src/app/features/swaps/models/PromoCode';
import { PromoCodeApiService } from 'src/app/core/services/backend/promo-code-api/promo-code-api.service';
import { Observable, of, Subject } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { debounceTime, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { NgChanges } from 'src/app/shared/models/utility-types/NgChanges';
import { AuthService } from 'src/app/core/services/auth/auth.service';

/**
 * Crosschain routing promocode input
 */
@Component({
  selector: 'app-ccr-promocode',
  templateUrl: './ccr-promocode.component.html',
  styleUrls: ['./ccr-promocode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CcrPromocodeComponent implements OnInit, OnChanges {
  /**
   * Sets promo code object
   */
  @Input() promoCode: PromoCode | null = null;

  /**
   * Emits promo code object after text input and validation
   */
  @Output() promoCodeChange = new EventEmitter<PromoCode | null>();

  @ViewChildren('loading,accepted,wrong') iconsTemplates: QueryList<TemplateRef<unknown>>;

  public promoCodeText: string;

  public validationInProcess = false;

  public isLoggedIn$: Observable<boolean>;

  private debouncePromoCodeInput$ = new Subject<string>();

  public get iconTemplate(): TemplateRef<unknown> | '' {
    if (!this.iconsTemplates) {
      return '';
    }

    if (this.validationInProcess) {
      return this.iconsTemplates.get(0);
    }

    if (!this.promoCode?.status) {
      return '';
    }

    return this.promoCode.status === 'accepted'
      ? this.iconsTemplates.get(1)
      : this.iconsTemplates.get(2);
  }

  constructor(
    private readonly promoCodeApiService: PromoCodeApiService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    this.isLoggedIn$ = authService.getCurrentUser().pipe(map(user => !!user?.address));
  }

  ngOnInit() {
    this.debouncePromoCodeInput$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        tap(() => {
          this.validationInProcess = true;
          this.cdr.markForCheck();
        }),
        switchMap(promoCodeText =>
          promoCodeText ? this.promoCodeApiService.validatePromoCode(promoCodeText) : of(null)
        )
      )
      .subscribe(promoCode => {
        this.validationInProcess = false;
        this.promoCode = promoCode;
        this.promoCodeChange.emit(promoCode);
        this.cdr.markForCheck();
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
