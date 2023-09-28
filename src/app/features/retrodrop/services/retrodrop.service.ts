import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { BehaviorSubject, from, of } from 'rxjs';
import { RetrodropUserInfo } from '@features/retrodrop/models/retrodrop-user-info';
import { defaultUserClaimInfo } from '@shared/services/token-distribution-services/constants/default-user-claim-info';
import { catchError } from 'rxjs/operators';
import { Web3Pure } from 'rubic-sdk';
import { RetrodropApiService } from '@features/retrodrop/services/retrodrop-api.service';
import { retrodropContractAddress } from '@features/retrodrop/constants/retrodrop-contract-address';
import { retrodropRounds } from '@features/retrodrop/constants/retrodrop-rounds';
import { ClaimWeb3Service } from '@shared/services/token-distribution-services/claim-web3.service';
import BigNumber from 'bignumber.js';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { switchTap } from '@shared/utils/utils';

@Injectable({
  providedIn: 'root'
})
export class RetrodropService {
  private readonly _fetchUserInfoLoading$ = new BehaviorSubject(false);

  public readonly fetchUserInfoLoading$ = this._fetchUserInfoLoading$.asObservable();

  private readonly _rounds$ = new BehaviorSubject<ClaimRound[]>([]);

  public readonly rounds$ = this._rounds$.asObservable();

  private readonly _retrodropUserInfo$ = new BehaviorSubject<RetrodropUserInfo>([
    defaultUserClaimInfo
  ]);

  private readonly _isUserParticipantOfRetrodrop$ = new BehaviorSubject(false);

  public readonly isUserParticipantOfRetrodrop$ =
    this._isUserParticipantOfRetrodrop$.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly apiService: RetrodropApiService,
    private readonly web3Service: ClaimWeb3Service
  ) {
    this.subscribeOnWalletChange();
  }

  private subscribeOnWalletChange(): void {
    this.authService.currentUser$?.subscribe(user => {
      if (!user || !user.address) {
        return null;
      }

      this.setUserInfo(user.address);
    });
  }

  private setUserInfo(address: string): void {
    this._fetchUserInfoLoading$.next(true);

    this.apiService
      .fetchRetrodropUserInfo()
      .pipe(
        switchTap(retrodropUserInfo => {
          this._retrodropUserInfo$.next(retrodropUserInfo);

          this._isUserParticipantOfRetrodrop$.next(
            retrodropUserInfo.some(round => round.is_participant)
          );

          return from(this.setRounds(address, retrodropUserInfo));
        }),
        catchError(() => of())
      )
      .subscribe(() => this._fetchUserInfoLoading$.next(false));
  }

  private async setRounds(
    userAddress: string,
    retrodropUserInfo: RetrodropUserInfo
  ): Promise<void> {
    const promisesRounds = retrodropUserInfo.map(claim => {
      if (claim.is_participant) {
        const amount = Web3Pure.fromWei(claim.amount);

        return this.web3Service
          .checkClaimed(retrodropContractAddress[claim.round - 1], claim.index)
          .then(isAlreadyClaimed => {
            const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);

            return {
              ...searchedRound,
              claimData: {
                contractAddress: retrodropContractAddress[claim.round - 1],
                node: {
                  index: claim.index,
                  account: userAddress,
                  amount: amount
                },
                proof: claim.proof
              },
              claimAmount: amount?.gt(0) ? amount : new BigNumber(0),
              isParticipantOfPrevRounds: claim.is_participant && claim.round <= 1,
              isParticipantOfCurrentRound: claim.is_participant,
              isAlreadyClaimed
            };
          });
      } else {
        const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);
        return new Promise<ClaimRound>(resolve => resolve({ ...searchedRound, ...claim }));
      }
    });

    const formattedRounds = await Promise.all(promisesRounds);
    this._rounds$.next(formattedRounds);
  }
}
