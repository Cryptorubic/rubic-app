import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { BehaviorSubject, combineLatestWith, from, of } from 'rxjs';
import { RetrodropUserInfo } from '@features/retrodrop/models/retrodrop-user-info';
import { catchError, map, tap } from 'rxjs/operators';
import { BlockchainName, Web3Pure } from 'rubic-sdk';
import { RetrodropApiService } from '@features/retrodrop/services/retrodrop-api.service';
import { retrodropContractAddress } from '@features/retrodrop/constants/retrodrop-contract-address';
import { retrodropRounds } from '@features/retrodrop/constants/retrodrop-rounds';
import { ClaimWeb3Service } from '@shared/services/token-distribution-services/claim-web3.service';
import BigNumber from 'bignumber.js';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { switchTap } from '@shared/utils/utils';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable()
export class RetrodropService {
  private readonly _fetchUserInfoLoading$ = new BehaviorSubject(false);

  public readonly fetchUserInfoLoading$ = this._fetchUserInfoLoading$.asObservable();

  private readonly _rounds$ = new BehaviorSubject<ClaimRound[]>([]);

  public readonly rounds$ = this._rounds$.asObservable();

  private readonly _fetchError$ = new BehaviorSubject<boolean>(false);

  public readonly fetchError$ = this._fetchError$.asObservable();

  private readonly _isUserParticipantOfRetrodrop$ = new BehaviorSubject(false);

  public readonly isUserParticipantOfRetrodrop$ =
    this._isUserParticipantOfRetrodrop$.asObservable();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly apiService: RetrodropApiService,
    private readonly web3Service: ClaimWeb3Service
  ) {
    this.subscribeOnWalletChange();
  }

  private subscribeOnWalletChange(): void {
    this.authService.currentUser$
      .pipe(
        combineLatestWith(this.walletConnectorService.networkChange$),
        tap(([user, network]) => {
          if (!user || !user.address) {
            return null;
          }

          this.setUserInfo(user.address, network);
        })
      )
      .subscribe();
  }

  private setUserInfo(userAddress: string, network: BlockchainName): void {
    this._fetchUserInfoLoading$.next(true);

    this.apiService
      .fetchRetrodropUserInfo()
      .pipe(
        switchTap(retrodropUserInfo => {
          this._isUserParticipantOfRetrodrop$.next(
            retrodropUserInfo.some(round => round.is_participant)
          );

          return from(this.setRounds(userAddress, network, retrodropUserInfo));
        }),
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
      if (claim.is_participant) {
        const amount = Web3Pure.fromWei(claim.amount);

        return this.web3Service
          .checkClaimed(retrodropContractAddress[claim.round - 1], claim.index)
          .then(isAlreadyClaimed => {
            const searchedRound = retrodropRounds.find(round => round.roundNumber === claim.round);

            return {
              ...searchedRound,
              network,
              claimData: {
                contractAddress: retrodropContractAddress[claim.round - 1],
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

  public updateRound(roundNumber: number): void {
    this.rounds$
      .pipe(
        map(rounds => {
          return rounds.map(round => {
            if (round.roundNumber === roundNumber) {
              return {
                ...round,
                isAlreadyClaimed: true
              };
            } else {
              return round;
            }
          });
        }),
        tap(updatedRounds => this._rounds$.next(updatedRounds))
      )
      .subscribe();
  }
}
