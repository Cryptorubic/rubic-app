import { Injectable } from '@angular/core';
import { forkJoin, interval, Observable, of, shareReplay } from 'rxjs';
import { map, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { pageState } from '@features/testnet-promo/constants/page-state';
import { switchIif } from '@shared/utils/utils';
import { TestnetPromoApiService } from '@features/testnet-promo/services/testnet-promo-api.service';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { PageState } from '@features/testnet-promo/interfaces/page-state.interface';
import { WeekInfo } from '@features/testnet-promo/interfaces/week-info';
import { TestnetPromoNotificationService } from '@features/testnet-promo/services/testnet-promo-notification.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable()
export class TestnetPromoStateService {
  public readonly tokensPerWeek = 500;

  public readonly tokensPerAction = 100;

  private readonly currentUser$: Observable<{ address: string }> =
    this.walletConnectorService.activeWallets$.pipe(
      map(activeWallets => {
        const evmWalletAdapter = this.walletConnectorService.getActiveProvider({
          chainType: 'EVM'
        });
        if (evmWalletAdapter) {
          return { address: evmWalletAdapter.address };
        }
        if (activeWallets.length) {
          this.notificationService.showWrongWalletNotification();
        }

        return { address: '' };
      })
    );

  public readonly pageState$: Observable<PageState> = this.currentUser$.pipe(
    switchMap(user => {
      if (!user?.address) {
        return of(pageState.noWallet);
      } else {
        return this.verification$.pipe(
          switchMap(verification => {
            return this.prizePool$.pipe(
              map(prizePool => {
                if (prizePool.left <= 0) {
                  return pageState.ended;
                }
                return verification?.isVerified ? pageState.inAction : pageState.notVerifiedUser;
              })
            );
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
          takeWhile(status => !status?.isVerified, true)
        ),
      () => of(null)
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly weekInfo$: Observable<WeekInfo> = this.verification$.pipe(
    switchIif(
      verification => verification?.isVerified,
      verification =>
        forkJoin([
          this.apiService.fetchMainnetSwaps(verification.address),
          this.apiService.fetchTestnetSwaps(verification.address)
        ]).pipe(
          map(([mainnet, testnet]) => {
            const combos = Math.min(mainnet.totalTrades, Math.floor(testnet.totalTrades / 5));
            let earnedPoints = combos * this.tokensPerAction;
            if (earnedPoints > this.tokensPerWeek) {
              earnedPoints = this.tokensPerWeek;
            }
            return {
              testnet: testnet.totalTrades,
              mainnet: mainnet.totalTrades,
              max: this.tokensPerWeek,
              earned: earnedPoints,
              fromDate: mainnet.startDatetime.replace(/\.\d{4}/, ''),
              toDate: mainnet.endDatetime.replace(/\.\d{4}/, '')
            };
          })
        ),
      () => of(null)
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly userProofs$ = this.verification$.pipe(
    switchIif(
      verification => verification?.isVerified,
      verification => this.apiService.fetchProofs(verification.address),
      () => of(null)
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly prizePool$ = this.apiService
    .fetchPrizePool()
    .pipe(shareReplay(shareReplayConfig));

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly apiService: TestnetPromoApiService,
    private readonly notificationService: TestnetPromoNotificationService
  ) {}
}
