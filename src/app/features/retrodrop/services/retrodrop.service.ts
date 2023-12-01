import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of } from 'rxjs';
import { RetrodropUserInfo } from '@features/retrodrop/models/retrodrop-user-info';
import { catchError } from 'rxjs/operators';
import { BlockchainName, Web3Pure } from 'rubic-sdk';
import { RetrodropApiService } from '@features/retrodrop/services/retrodrop-api.service';
import { retrodropContractAddress } from '@features/retrodrop/constants/retrodrop-contract-address';
import { retrodropRounds } from '@features/retrodrop/constants/retrodrop-rounds';
import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { switchTap } from '@shared/utils/utils';
import { ClaimService } from '@shared/services/claim-services/claim.services';

@Injectable()
export class RetrodropService extends ClaimService {
  private readonly _isUserParticipantOfRetrodrop$ = new BehaviorSubject(false);

  public readonly isUserParticipantOfRetrodrop$ =
    this._isUserParticipantOfRetrodrop$.asObservable();

  constructor(private readonly retrodropApiService: RetrodropApiService) {
    super();
    this.subscribeOnWalletChange();
  }

  protected setUserInfo(network: BlockchainName, userAddress: string): void {
    this._fetchUserInfoLoading$.next(true);

    this.retrodropApiService
      .fetchRetrodropUserInfo(userAddress)
      .pipe(
        switchTap(retrodropUserInfo => {
          this._isUserParticipantOfRetrodrop$.next(
            retrodropUserInfo.some(round => round.is_participant)
          );

          return from(this.setRounds(userAddress, network, retrodropUserInfo));
        }),
        // @TODO refactoring _fetchError$ logic
        catchError(() => {
          this._fetchError$.next(true);
          return of();
        })
      )
      .subscribe(() => {
        this._fetchError$.next(false);
        this._fetchUserInfoLoading$.next(false);
      });
  }

  private async setRounds(
    userAddress: string,
    network: BlockchainName,
    retrodropUserInfo: RetrodropUserInfo
  ): Promise<void> {
    const promisesRounds = retrodropUserInfo.map(claim => {
      const contractAddress = retrodropContractAddress[claim.round - 1];

      if (claim.is_participant && contractAddress) {
        const amount = Web3Pure.fromWei(claim.amount);

        return this.claimWeb3Service
          .checkClaimed(retrodropContractAddress[claim.round - 1], claim.index)
          .then(isAlreadyClaimed => {
            const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);

            return {
              ...searchedRound,
              network,
              claimData: {
                contractAddress,
                node: {
                  index: claim.index,
                  account: userAddress,
                  amount: EthersBigNumber.from(claim.amount)
                },
                proof: claim.proof
              },
              claimAmount: amount?.gt(0) ? amount : new BigNumber(0),
              isParticipantOfPrevRounds: true,
              isParticipantOfCurrentRound: claim.is_participant,
              isAlreadyClaimed
            };
          });
      } else {
        const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);
        return new Promise<ClaimRound>(resolve =>
          resolve({
            ...searchedRound,
            network,
            ...claim,
            claimData: {
              ...searchedRound.claimData,
              node: {
                ...searchedRound.claimData.node,
                account: userAddress
              }
            }
          })
        );
      }
    });

    const formattedRounds = await Promise.all(promisesRounds);
    this._rounds$.next(formattedRounds);
  }
}
