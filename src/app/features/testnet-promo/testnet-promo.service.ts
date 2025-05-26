import { Injectable } from '@angular/core';
import {
  distinctUntilChanged,
  forkJoin,
  interval,
  Observable,
  of,
  shareReplay,
  Subscription
} from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { map, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { pageState } from '@features/testnet-promo/constants/page-state';
import { switchIif } from '@shared/utils/utils';
import { TestnetPromoApiService } from '@features/testnet-promo/services/testnet-promo-api.service';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { PageState } from '@features/testnet-promo/interfaces/page-state.interface';
import { WeekInfo } from '@features/testnet-promo/interfaces/week-info';
import { CHAIN_TYPE } from 'rubic-sdk';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';

@Injectable()
export class TestnetPromoService {
  private wrongWalletTypeSubscription: Subscription | null = null;

  private readonly currentUser$ = this.authService.currentUser$.pipe(
    distinctUntilChanged((prev, curr) => prev?.address === curr?.address),
    map(user => {
      if (user?.chainType === CHAIN_TYPE.EVM) {
        return user;
      }
      if (user?.address) {
        this.showWrongWalletNotification();
      }

      return { ...user, address: '' };
    })
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
          }),
          startWith(pageState.verifying)
        );
      }
    }),
    startWith(pageState.noWallet)
  );

  public readonly verification$ = this.currentUser$.pipe(
    switchIif(
      user => Boolean(user?.address),
      user =>
        interval(30_000).pipe(
          startWith(-1),
          switchMap(() => this.apiService.getUserVerification(user.address)),
          takeWhile(status => !status.isVerified, true)
        ),
      () => of(null)
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly weekInfo$: Observable<WeekInfo> = this.verification$.pipe(
    switchIif(
      verification => verification.isVerified,
      () =>
        forkJoin([
          this.apiService.fetchMainnetSwaps(this.authService.userAddress),
          this.apiService.fetchTestnetSwaps(this.authService.userAddress)
        ]).pipe(
          map(([mainnet, testnet]) => {
            const combos = Math.min(mainnet.totalTrades, Math.floor(testnet.totalTrades / 5));
            let earnedPoints = combos * 12;
            if (earnedPoints > 420) {
              earnedPoints = 420;
            }
            return {
              testnet: testnet.totalTrades,
              mainnet: mainnet.totalTrades,
              max: 420,
              earned: earnedPoints
            };
          })
        ),
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
    private readonly apiService: TestnetPromoApiService,
    private readonly notificationsService: NotificationsService
  ) {}

  private showWrongWalletNotification(): void {
    if (!this.wrongWalletTypeSubscription) {
      this.wrongWalletTypeSubscription = this.notificationsService.show(
        'Wrong wallet. You should connect EVM wallet to participate in the Promo.',
        {
          status: TuiNotification.Error,
          autoClose: 10000,
          data: null,
          icon: '',
          defaultAutoCloseTime: 0
        }
      );
    }
  }
}
