import { Injectable } from '@angular/core';
import { interval, Observable, of, Subscription } from 'rxjs';
import {
  AcceptedPromoCode,
  BasicPromoCode,
  OutdatedPromoCode,
  PromoCode,
  RejectedPromoCode,
  WrongPromoCode
} from 'src/app/features/swaps/models/PromoCode';
import { HttpService } from 'src/app/core/services/http/http.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import {
  PromoCodeApiResponse,
  PromoCodesCheckExistenceResponse
} from 'src/app/core/services/backend/promo-code-api/models/promo-code-api-response';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root'
})
export class PromoCodeApiService {
  private static readonly apiUrl = 'promo/code';

  private static defaultUpdateInterval = 5000;

  private interval$: Observable<number>;

  private intervalSubscription$: Subscription;

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService
  ) {
    this.promoCodesExists().subscribe();
  }

  /**
   * Checks if at least one active promo code exists.
   */
  @Cacheable()
  public promoCodesExists(): Observable<boolean> {
    const endpoint = 'check';
    return this.httpService
      .get<PromoCodesCheckExistenceResponse>(`${PromoCodeApiService.apiUrl}/${endpoint}`)
      .pipe(
        map(response => response.exists),
        catchError((e: unknown) => {
          console.error(e);
          return of(false);
        })
      );
  }

  /**
   * Validates text promo code.
   * @param promoCodeText text to validate.
   * @param [autoRevalidateIfAccepted = false] if true and promo code status is accepted, sets interval to refresh promo code data.
   * @param [revalidationTimeout = 5000] promo code data refreshing interval.
   * @returns string promo code with status ('accepted' | 'outdated' | 'wrong' | 'rejected') and additional promo code data.
   */
  public validatePromoCode(
    promoCodeText: string,
    autoRevalidateIfAccepted = false,
    revalidationTimeout = PromoCodeApiService.defaultUpdateInterval
  ): Observable<PromoCode | null> {
    return this.getPromoCodeByText(promoCodeText).pipe(
      tap(promoCode => {
        this.clearInterval();
        if (autoRevalidateIfAccepted && promoCode.status === 'accepted') {
          this.setInterval(revalidationTimeout);
        }
      })
    );
  }

  /**
   * Sets revalidation interval.
   * @param revalidationTimeout promo code data refreshing interval.
   */
  private setInterval(revalidationTimeout: number): void {
    this.interval$ = interval(revalidationTimeout);

    this.intervalSubscription$ = this.interval$
      .pipe(
        map(() => this.settingsService.crossChainRoutingValue.promoCode?.text),
        filter(promoCodeText => !!promoCodeText),
        switchMap(promoCodeText => this.getPromoCodeByText(promoCodeText))
      )
      .subscribe(promoCode => this.settingsService.crossChainRouting.patchValue({ promoCode }));
  }

  /**
   * Clears revalidation interval.
   */
  private clearInterval(): void {
    this.intervalSubscription$?.unsubscribe();
  }

  /**
   * Fetches from backend promo code by its text.
   * @param promoCodeText text to find promo code by.
   */
  private getPromoCodeByText(promoCodeText: string): Observable<PromoCode | null> {
    if (!promoCodeText) {
      return of(null);
    }

    return this.httpService
      .get<PromoCodeApiResponse>(PromoCodeApiService.apiUrl, {
        walletAddress: this.authService.userAddress,
        promoCode: promoCodeText
      })
      .pipe(
        map(response => this.parseApiResponse(promoCodeText, response)),
        catchError((err: unknown) => {
          console.error(err);
          return of({
            status: 'wrong' as const,
            text: promoCodeText
          });
        })
      );
  }

  /**
   * Parses promo code api response.
   */
  private parseApiResponse(promoCodeText: string, response: PromoCodeApiResponse): PromoCode {
    const promo: BasicPromoCode = { status: response.status, text: promoCodeText };
    if (response.status === 'accepted') {
      return {
        ...promo,
        usesLeft: response.details.usesLeft,
        usesLimit: response.details.usesLimit,
        validUntil: new Date(Date.now() + response.details.timeLeft * 1000)
      } as AcceptedPromoCode;
    }

    if (response.status === 'rejected') {
      return {
        ...promo,
        code: response.details.code
      } as RejectedPromoCode;
    }

    return promo as OutdatedPromoCode | WrongPromoCode;
  }
}
