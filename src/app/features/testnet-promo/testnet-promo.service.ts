import { Injectable } from '@angular/core';
import { distinctUntilChanged, interval, Observable, of, shareReplay } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { map, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { pageState } from '@features/testnet-promo/constants/page-state';
import { switchIif } from '@shared/utils/utils';
import { TestnetPromoApiService } from '@features/testnet-promo/services/testnet-promo-api.service';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { PageState } from '@features/testnet-promo/interfaces/page-state.interface';

@Injectable()
export class TestnetPromoService {
  private readonly currentUser$ = this.authService.currentUser$.pipe(
    distinctUntilChanged((prev, curr) => prev?.address === curr?.address)
  );

  public readonly pageState$: Observable<PageState> = this.currentUser$.pipe(
    switchMap(user => {
      if (!user?.address) {
        return of(pageState.noWallet);
      } else {
        return this.verification$.pipe(
          switchMap(verification => {
            if (verification?.isVerified) {
              return this.prizePool$.pipe(
                map(prizePool => {
                  return prizePool.left > 0 ? pageState.inAction : pageState.ended;
                })
              );
            } else {
              return of(pageState.notVerifiedUser);
            }
          })
        );
      }
    })
  );

  public readonly verification$ = this.currentUser$.pipe(
    switchIif(
      user => Boolean(user?.address),
      user =>
        interval(10_000).pipe(
          startWith(-1),
          switchMap(() => this.apiService.getUserVerification(user.address)),
          takeWhile(status => !status.isVerified, true)
        ),
      () => of(null)
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly weekInfo$ = this.verification$.pipe(
    switchIif(
      verification => verification.isVerified,
      () =>
        this.apiService
          .fetchUserStats(this.authService.userAddress)
          .pipe(map(el => el.currentWeek)),
      () => of(null)
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly userProofs$ = this.verification$.pipe(
    switchIif(
      verification => verification.isVerified,
      () => this.apiService.fetchProofs(this.authService.userAddress),
      () => of(null)
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly prizePool$ = this.apiService
    .fetchPrizePool()
    .pipe(shareReplay(shareReplayConfig));

  constructor(
    private readonly authService: AuthService,
    private readonly apiService: TestnetPromoApiService
  ) {}
}
