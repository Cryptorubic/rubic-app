import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { AirdropUserPointsInfo } from '@features/airdrop/models/airdrop-user-info';
import { tap } from 'rxjs/operators';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { switchIif } from '@shared/utils/utils';
import { HttpService } from '@core/services/http/http.service';
import { ModalService } from '@core/modals/services/modal.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AirdropPointsApiService } from '@shared/services/airdrop-points-service/airdrop-points-api.service';
import { Injectable } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { AuthService } from '@core/services/auth/auth.service';
import { TO_BACKEND_BLOCKCHAINS } from '@app/shared/constants/blockchain/backend-blockchains';
import {
  CrossChainRewardConvertedData,
  OnChainRewardConvertedData
} from './models/airdrop-api-types';
import { AirdropUtils } from './utils/airdrop-utils';

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

  private readonly _pointsAmount$ = new BehaviorSubject<number>(0);

  public readonly pointsAmount$ = this._pointsAmount$.asObservable();

  public providersCrossChainRewardData: CrossChainRewardConvertedData;

  public providersOnChainRewardData: OnChainRewardConvertedData;

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
          return this.apiService.fetchAirdropUserPointsInfo(currentUser?.address);
        }),
        tap(points => {
          this._points$.next(points);
          this._fetchUserPointsInfoLoading$.next(false);
        })
      )
      .subscribe();
  }

  /**
   * @deprecated
   * @temporary
   * @remove
   * @todo remove after backend update
   */
  public setSeNPointsTemp(type: 'cross-chain' | 'on-chain'): Observable<number> {
    const address = this.authService.user.address;

    if (type === 'on-chain') {
      return this.apiService
        .getOnChainPoints(address)
        .pipe(tap(points => this._pointsAmount$.next(points)));
    }

    return this.apiService
      .getCrossChainPoints(address)
      .pipe(tap(points => this._pointsAmount$.next(points)));
  }

  public async getSwapAndEarnPointsAmount(
    fromTokenAddress: string,
    fromTokenBlockchain: BlockchainName,
    toTokenAddress: string,
    toTokenBlockchain: BlockchainName
  ): Promise<void> {
    const address = this.authService.user.address;
    const from_token = fromTokenAddress;
    const to_token = toTokenAddress;
    const type = fromTokenBlockchain === toTokenBlockchain ? 'on-chain' : 'cross-chain';

    if (type === 'on-chain') {
      const network = TO_BACKEND_BLOCKCHAINS[fromTokenBlockchain];
      //SET PROVIDER_ADDRESS AND POINTS IN SWAP

      const res = await this.apiService.getOnChainRewardData({
        address,
        from_token,
        to_token,
        network
      });

      this.providersOnChainRewardData = AirdropUtils.convertOnChainRewardData(res);
    } else {
      const from_network = TO_BACKEND_BLOCKCHAINS[fromTokenBlockchain];
      const to_network = TO_BACKEND_BLOCKCHAINS[toTokenBlockchain];

      const res = await this.apiService.getCrossChainRewardData({
        address,
        from_token,
        to_token,
        from_network,
        to_network
      });

      this.providersCrossChainRewardData = AirdropUtils.convertCrosschainRewardData(res);
    }
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
