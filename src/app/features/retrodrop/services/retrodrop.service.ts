import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { RetrodropUserInfo } from '@features/retrodrop/models/retrodrop-user-info';
import { defaultUserClaimInfo } from '@shared/services/token-distribution-services/constants/default-user-claim-info';
import { tap } from 'rxjs/operators';
import { Web3Pure } from 'rubic-sdk';
import { RetrodropApiService } from '@features/retrodrop/services/retrodrop-api.service';
import { retrodropContractAddress } from '@features/retrodrop/constants/retrodrop-contract-address';
import { retrodropRounds } from '@features/retrodrop/constants/retrodrop-rounds';
import { ClaimWeb3Service } from '@shared/services/token-distribution-services/claim-web3.service';
import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';

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
        tap(retrodropUserInfo => {
          this._retrodropUserInfo$.next(retrodropUserInfo);

          this._isUserParticipantOfRetrodrop$.next(
            retrodropUserInfo.some(round => round.is_participant)
          );

          this.setRounds(address, retrodropUserInfo);
          this._fetchUserInfoLoading$.next(false);
        })
      )
      .subscribe();
  }

  private async setRounds(
    userAddress: string,
    retrodropUserInfo: RetrodropUserInfo
  ): Promise<void> {
    const rounds = retrodropUserInfo.map(async claim => {
      const isParticipantOfPrevRounds = claim.is_participant && claim.round <= 1;
      const amount = Web3Pure.fromWei(claim.amount);
      const claimAmount = amount?.gt(0) ? amount : new BigNumber(0);
      const claimData: ClaimTokensData = {
        contractAddress: retrodropContractAddress[claim.round - 1],
        node: {
          index: claim.index,
          account: userAddress,
          amount: EthersBigNumber.from(claim.amount)
        },
        proof: claim.proof
      };

      const isAlreadyClaimed = await this.web3Service.checkClaimed(
        retrodropContractAddress[claim.round - 1],
        claim.index
      );
      const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);
      return {
        ...searchedRound,
        claimData,
        claimAmount,
        isParticipantOfPrevRounds,
        isParticipantOfCurrentRound: claim.is_participant,
        isAlreadyClaimed
      };
    });
    this._rounds$.next(await Promise.all(rounds));
  }
}
