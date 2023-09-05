import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Observable, of } from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { switchIif } from '@shared/utils/utils';
import { HttpService } from '@core/services/http/http.service';
import {
  SwapToEarnUserClaimInfo,
  SwapToEarnUserPointsInfo
} from '@features/swap-and-earn/models/swap-to-earn-user-info';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { ModalService } from '@core/modals/services/modal.service';
import { SenTab } from '@features/swap-and-earn/models/swap-to-earn-tabs';
import {
  RetrodropUserAddressRoundValid,
  RetrodropUserAlreadyClaimed,
  RetrodropUserClaimedAmount,
  RetrodropUserInfo
} from '@features/swap-and-earn/models/retrodrop-user-info';
import { Web3Pure } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { SwapAndEarnApiService } from '@features/swap-and-earn/services/swap-and-earn-api.service';

@Injectable({ providedIn: 'root' })
export class SwapAndEarnStateService {
  private readonly defaultUserClaimInfo: SwapToEarnUserClaimInfo = {
    round: null,
    is_participant: false,
    address: '',
    index: null,
    amount: '',
    proof: []
  };

  private readonly defaultPoints: SwapToEarnUserPointsInfo = {
    confirmed: 0,
    pending: 0
  };

  private readonly _workingStatus$ = new BehaviorSubject(false);

  public readonly workingStatus$ = this._workingStatus$.asObservable();

  private readonly _points$ = new BehaviorSubject<SwapToEarnUserPointsInfo>(this.defaultPoints);

  public readonly points$ = this._points$.asObservable();

  private readonly _currentTab$ = new BehaviorSubject<SenTab>(
    SwapAndEarnStateService.setDefaultTab()
  );

  public readonly currentTab$ = this._currentTab$.asObservable();

  private readonly _swapToEarnUserClaimInfo$ = new BehaviorSubject<SwapToEarnUserClaimInfo>(
    this.defaultUserClaimInfo
  );

  private readonly _retrodropUserInfo$ = new BehaviorSubject<RetrodropUserInfo>([
    this.defaultUserClaimInfo
  ]);

  // Is round already claimed

  private readonly _isAirdropRoundAlreadyClaimed$ = new BehaviorSubject(false);

  public readonly isAirdropRoundAlreadyClaimed$ =
    this._isAirdropRoundAlreadyClaimed$.asObservable();

  private readonly _isRetrodropRoundsAlreadyClaimed$ = new BehaviorSubject<
    RetrodropUserAlreadyClaimed[]
  >([]);

  public readonly isRetrodropRoundsAlreadyClaimed$ =
    this._isRetrodropRoundsAlreadyClaimed$.asObservable();

  // Claimed amounts

  private readonly _airdropClaimedTokens$ = new BehaviorSubject(new BigNumber(0));

  public readonly airdropClaimedTokens$ = this._airdropClaimedTokens$.asObservable();

  private readonly _retrodropClaimedTokens$ = new BehaviorSubject<RetrodropUserClaimedAmount[]>([]);

  // Retrodrop validity

  private readonly _isRetrodropRoundsAddressValid$ = new BehaviorSubject<
    RetrodropUserAddressRoundValid[]
  >([]);

  public readonly isRetrodropRoundsAddressValid$ =
    this._isRetrodropRoundsAddressValid$.asObservable();

  private readonly _isUserParticipantOfSwapAndEarn$ = new BehaviorSubject(false);

  public readonly isUserParticipantOfSwapAndEarn$ =
    this._isUserParticipantOfSwapAndEarn$.asObservable();

  private readonly _isUserParticipantOfRetrodrop$ = new BehaviorSubject(false);

  public readonly isUserParticipantOfRetrodrop$ =
    this._isUserParticipantOfRetrodrop$.asObservable();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpService,
    private readonly dialogService: ModalService,
    private readonly swapAndEarnApiService: SwapAndEarnApiService,
    @Inject(INJECTOR) private readonly injector: Injector
  ) {
    this.handleAddressChange();
    this.fetchWorkingStatus();
  }

  public get currentTab(): SenTab {
    return this._currentTab$.getValue();
  }

  public get airdropUserClaimInfo(): SwapToEarnUserClaimInfo {
    return this._swapToEarnUserClaimInfo$.getValue();
  }

  public get retrodropUserInfo(): RetrodropUserInfo {
    return this._retrodropUserInfo$.getValue();
  }

  public get retrodropClaimedAmounts(): RetrodropUserClaimedAmount[] {
    return this._retrodropClaimedTokens$.getValue();
  }

  public set isAirdropRoundAlreadyClaimed(value: boolean) {
    this._isAirdropRoundAlreadyClaimed$.next(value);
  }

  public set isUserParticipantOfSwapAndEarn(value: boolean) {
    this._isUserParticipantOfSwapAndEarn$.next(value);
  }

  public set isRetrodropRoundsAlreadyClaimed(value: RetrodropUserAlreadyClaimed[]) {
    this._isRetrodropRoundsAlreadyClaimed$.next(value);
  }

  public set airdropUserClaimInfo(value: SwapToEarnUserClaimInfo) {
    this._swapToEarnUserClaimInfo$.next(value);
  }

  public set retrodropUserInfo(value: RetrodropUserInfo) {
    this._retrodropUserInfo$.next(value);
  }

  public set currentTab(tab: SenTab) {
    this._currentTab$.next(tab);
  }

  private static setDefaultTab(): SenTab {
    return window.location.pathname.includes('retrodrop') ? 'retrodrop' : 'airdrop';
  }

  private fetchWorkingStatus(): void {
    this._workingStatus$.next(true);
  }

  public async updateSwapToEarnUserPointsInfo(): Promise<void> {
    await this.swapAndEarnApiService.fetchSwapToEarnUserPointsInfo().subscribe(points => {
      this._points$.next(points);
    });
  }

  public setClaimedTokens(): void {
    this._airdropClaimedTokens$.next(Web3Pure.fromWei(this.airdropUserClaimInfo.amount));
    this._retrodropClaimedTokens$.next(
      this.retrodropUserInfo.map(userInfo => ({
        round: userInfo.round,
        amount: Web3Pure.fromWei(userInfo.amount)
      }))
    );
  }

  public setRetrodropRoundsAddressValid(): void {
    const isRetrodropRoundsAddressValid = this.retrodropUserInfo.map(userInfo => {
      return {
        round: userInfo.round,
        isValid: userInfo.is_participant
      };
    });

    this._isUserParticipantOfRetrodrop$.next(
      isRetrodropRoundsAddressValid.some(round => round.isValid)
    );

    this._isRetrodropRoundsAddressValid$.next(isRetrodropRoundsAddressValid);
  }

  public getSwapAndEarnPointsAmount(): Observable<number> {
    return this.points$.pipe(
      map(points => {
        if (points.participant) {
          return 50;
        }

        return 100;
      })
    );
  }

  public async claimPoints(points: number): Promise<void> {
    const address = this.walletConnectorService.address;

    if (address) {
      await firstValueFrom(this.httpService.post(`rewards/withdraw/?address=${address}`));

      this.dialogService
        .showDialog(SuccessWithdrawModalComponent, {
          data: {
            points: points
          }
        })
        .subscribe();

      await this.updateSwapToEarnUserPointsInfo();
    }
  }

  private handleAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        switchIif(
          Boolean,
          () => this.swapAndEarnApiService.fetchSwapToEarnUserPointsInfo(),
          () => of(this.defaultPoints)
        )
      )
      .subscribe(points => {
        this._points$.next(points);
      });
  }
}
