import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of } from 'rxjs';
import { switchIif, switchTap } from '@shared/utils/utils';
import { HttpService } from '@core/services/http/http.service';
import {
  AirdropUserClaimInfo,
  AirdropUserPointsInfo
} from '@features/airdrop/models/airdrop-user-info';
import { SuccessWithdrawModalComponent } from '@shared/components/success-modal/success-withdraw-modal/success-withdraw-modal.component';
import { ModalService } from '@core/modals/services/modal.service';
import { AirdropApiService } from '@features/airdrop/services/airdrop-api.service';
import { airdropContractAddress } from '@features/airdrop/constants/airdrop-contract-address';
import { defaultUserClaimInfo } from '@shared/services/token-distribution-services/constants/default-user-claim-info';
import { BlockchainName, Web3Pure } from 'rubic-sdk';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { airdropRounds } from '@features/airdrop/constants/airdrop-rounds';
import { catchError, tap } from 'rxjs/operators';
import { ClaimService } from '@shared/services/token-distribution-services/claim.services';

@Injectable({ providedIn: 'root' })
export class AirdropService extends ClaimService {
  private readonly defaultPoints: AirdropUserPointsInfo = {
    confirmed: 0,
    pending: 0
  };

  private readonly _fetchUserPointsInfoLoading$ = new BehaviorSubject(false);

  public readonly fetchUserPointsInfoLoading$ = this._fetchUserPointsInfoLoading$.asObservable();

  private readonly _points$ = new BehaviorSubject<AirdropUserPointsInfo>(this.defaultPoints);

  public readonly points$ = this._points$.asObservable();

  private readonly _airdropUserInfo$ = new BehaviorSubject<AirdropUserClaimInfo>(
    defaultUserClaimInfo
  );

  public readonly airdropUserInfo$ = this._airdropUserInfo$.asObservable();

  constructor(
    private readonly httpService: HttpService,
    private readonly dialogService: ModalService,
    private readonly apiService: AirdropApiService
  ) {
    super();
    this.handleAddressChange();
  }

  protected setUserInfo(network: BlockchainName, address: string): void {
    this._fetchUserInfoLoading$.next(true);

    this.apiService
      .fetchAirdropUserClaimInfo(address)
      .pipe(
        switchTap(airdropUserInfo => {
          this._airdropUserInfo$.next(airdropUserInfo);

          return from(this.setRounds(airdropUserInfo, network));
        }),
        catchError(() => {
          this._fetchError$.next(true);
          return of();
        })
      )
      .subscribe(() => {
        this._fetchUserInfoLoading$.next(false);
        this._fetchError$.next(false);
      });
  }

  private async setRounds(
    airdropUserInfo: AirdropUserClaimInfo,
    network: BlockchainName
  ): Promise<void> {
    const promisesRounds = airdropRounds.map(round => {
      if (airdropUserInfo.round === round.roundNumber) {
        return this.claimWeb3Service
          .checkClaimed(airdropContractAddress, airdropUserInfo.index)
          .then(isAlreadyClaimed => ({
            ...round,
            network,
            isAlreadyClaimed,
            isParticipantOfCurrentRound: airdropUserInfo.is_participant,
            claimAmount: Web3Pure.fromWei(airdropUserInfo.amount),
            claimData: {
              contractAddress: airdropContractAddress,
              node: {
                index: airdropUserInfo.index,
                account: airdropUserInfo.address,
                amount: EthersBigNumber.from(airdropUserInfo.amount)
              },
              proof: airdropUserInfo.proof
            }
          }));
      } else {
        return {
          ...round,
          ...airdropUserInfo,
          network,
          claimData: {
            ...round.claimData,
            node: {
              ...round.claimData.node,
              account: airdropUserInfo.address
            }
          }
        };
      }
    });

    const formattedRounds = await Promise.all(promisesRounds);
    this._rounds$.next(formattedRounds.reverse());
  }

  public updateSwapToEarnUserPointsInfo(): void {
    this._fetchUserPointsInfoLoading$.next(true);

    this.walletConnectorService.addressChange$.pipe(
      tap(address => {
        this.apiService.fetchAirdropUserPointsInfo(address).subscribe(points => {
          this._points$.next(points);
          this._fetchUserPointsInfoLoading$.next(false);
        });
      })
    );
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

  public async claimPoints(points: number, address: string): Promise<void> {
    if (address) {
      this.httpService.post(`rewards/withdraw/?address=${address}`);

      this.dialogService
        .showDialog(SuccessWithdrawModalComponent, {
          data: {
            points: points
          }
        })
        .subscribe();

      this.updateSwapToEarnUserPointsInfo();
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
