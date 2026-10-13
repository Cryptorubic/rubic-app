import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeWhile
} from 'rxjs/operators';
import { LoyaltyApiService } from '@app/core/services/backend/loyalty-api/loyalty-api.service';
import { LoyaltyEligibilityParams } from '@app/core/services/backend/loyalty-api/models/loyalty-eligibility';
import { TradePoints } from '@app/core/services/backend/loyalty-api/models/trade-points';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { EarnedPointsView } from '@app/features/trade/models/earned-points-view';
import { percentAddress } from '@app/features/trade/services/proxy-fee-service/const/fee-type-address-mapping';
import { compareAddresses } from '@shared/utils/utils';
import { PreviewSwapService } from '../preview-swap/preview-swap.service';

const TRADE_POINTS_POLL_MS = 3_000;
const HIDDEN_POINTS: EarnedPointsView = { loading: false, points: null };

@Injectable()
export class EarnedPointsService {
  public readonly earnsPoints$ = this.previewSwapService.selectedTradeState$.pipe(
    map(tradeState => tradeState?.trade ?? null),
    distinctUntilChanged(
      (previous, next) =>
        previous?.type === next?.type &&
        previous?.from.blockchain === next?.from.blockchain &&
        previous?.to.blockchain === next?.to.blockchain &&
        this.isZeroFeeIntegrator(previous) === this.isZeroFeeIntegrator(next)
    ),
    switchMap(trade => {
      if (!trade) {
        return of(false);
      }

      return this.loyaltyApiService.getEligibility(this.getEligibilityParams(trade)).pipe(
        map(response => response.eligible),
        catchError(() => of(false))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly previewSwapService: PreviewSwapService,
    private readonly loyaltyApiService: LoyaltyApiService
  ) {}

  private getEligibilityParams(trade: CrossChainTrade | OnChainTrade): LoyaltyEligibilityParams {
    return {
      provider: trade.type,
      fromBlockchain: trade.from.blockchain,
      toBlockchain: trade.to.blockchain,
      ...(this.isZeroFeeIntegrator(trade) ? { isZeroFee: true } : {})
    };
  }

  private isZeroFeeIntegrator(trade: CrossChainTrade | OnChainTrade | null): boolean {
    const integratorAddress = trade?.integratorAddress;

    return !!integratorAddress && compareAddresses(integratorAddress, percentAddress.zeroFee);
  }

  public earnedPointsFor(
    rubicId$: Observable<string | null | undefined>
  ): Observable<EarnedPointsView> {
    return this.earnsPoints$.pipe(
      first(),
      switchMap(eligible =>
        eligible
          ? rubicId$.pipe(
              first(),
              switchMap(rubicId => this.pollEarnedPoints(rubicId ?? undefined))
            )
          : of(HIDDEN_POINTS)
      )
    );
  }

  public pollEarnedPoints(rubicId: string | undefined): Observable<EarnedPointsView> {
    if (!rubicId) {
      return of(HIDDEN_POINTS);
    }

    return timer(0, TRADE_POINTS_POLL_MS).pipe(
      switchMap(() =>
        this.loyaltyApiService.getTradePoints(rubicId).pipe(catchError(() => of(null)))
      ),
      map(response => this.toEarnedPoints(response)),
      startWith<EarnedPointsView>({ loading: true, points: null }),
      takeWhile(result => result.loading, true)
    );
  }

  private toEarnedPoints(response: TradePoints | null): EarnedPointsView {
    if (!response || response.pointsStatus === 'rejected') {
      return HIDDEN_POINTS;
    }

    if (response.pointsStatus === 'pending' || response.pointsStatus === 'confirmed') {
      return { loading: false, points: response.points };
    }

    return { loading: true, points: null };
  }
}
