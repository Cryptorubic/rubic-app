import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';
import { AirdropUserPointsInfo } from '@features/airdrop/models/airdrop-user-info';
import { first, tap } from 'rxjs/operators';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { switchIif } from '@shared/utils/utils';
import { HttpService } from '@core/services/http/http.service';
import { ModalService } from '@core/modals/services/modal.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AirdropPointsApiService } from '@shared/services/airdrop-points-service/airdrop-points-api.service';
import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, OnChainTrade } from 'rubic-sdk';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AirdropPointsService {
  private readonly defaultPoints: AirdropUserPointsInfo = {
    confirmed: 0,
    pending: 0
  };

  private readonly _fetchUserPointsInfoLoading$ = new BehaviorSubject(false);

  public readonly fetchUserPointsInfoLoading$ = this._fetchUserPointsInfoLoading$.asObservable();

  private readonly _points$ = new BehaviorSubject<AirdropUserPointsInfo>(this.defaultPoints);

  public readonly points$ = this._points$.asObservable();

  constructor(
    private readonly httpService: HttpService,
    private readonly dialogService: ModalService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly apiService: AirdropPointsApiService,
    private readonly authService: AuthService
  ) {
    this.handleAddressChange();
  }

  public updateSwapToEarnUserPointsInfo(): void {
    this._fetchUserPointsInfoLoading$.next(true);

    this.authService.currentUser$
      .pipe(
        switchMap(currentUser => {
          return this.apiService.fetchAirdropUserPointsInfo(currentUser.address);
        }),
        tap(points => {
          this._points$.next(points);
          this._fetchUserPointsInfoLoading$.next(false);
        })
      )
      .subscribe();
  }

  public getSwapAndEarnPointsAmount(tradeType: CrossChainTrade | OnChainTrade): Observable<number> {
    return this.points$.pipe(
      first(),
      map(points => {
        let finalPoints = 0;

        if (tradeType instanceof CrossChainTrade) {
          finalPoints = points.participant ? 25 : 50;
        } else {
          finalPoints = points.participant ? 12 : 25;
        }

        return tradeType.to.blockchain === BLOCKCHAIN_NAME.LINEA ||
          tradeType.to.blockchain === BLOCKCHAIN_NAME.MANTA_PACIFIC
          ? Math.trunc(finalPoints / 2)
          : finalPoints;
      })
    );
  }

  public async claimPoints(points: number, address: string): Promise<void> {
    if (address) {
      this.httpService
        .post(`rewards/withdraw/?address=${address}`)
        .subscribe(() => this.updateSwapToEarnUserPointsInfo());

      this.dialogService
        .showDialog(SuccessWithdrawModalComponent, {
          data: {
            points: points
          }
        })
        .subscribe();
    }
  }

  private handleAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        switchIif(
          Boolean,
          address => this.apiService.fetchAirdropUserPointsInfo(address as string),
          () => of(this.defaultPoints)
        )
      )
      .subscribe(points => {
        this._points$.next(points);
      });
  }
}
