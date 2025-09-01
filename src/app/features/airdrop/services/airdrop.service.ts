import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of } from 'rxjs';
import { switchTap } from '@shared/utils/utils';
import { AirdropUserClaimInfo } from '@features/airdrop/models/airdrop-user-info';
import { AirdropApiService } from '@features/airdrop/services/airdrop-api.service';
import { airdropContractAddress } from '@features/airdrop/constants/airdrop-contract-address';
import { defaultUserClaimInfo } from '@shared/services/claim-services/constants/default-user-claim-info';
import { BlockchainName, Web3Pure } from '@cryptorubic/sdk';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { airdropRounds } from '@features/airdrop/constants/airdrop-rounds';
import { catchError } from 'rxjs/operators';
import { ClaimService } from '@shared/services/claim-services/claim.services';

@Injectable()
export class AirdropService extends ClaimService {
  private readonly _airdropUserInfo$ = new BehaviorSubject<AirdropUserClaimInfo>(
    defaultUserClaimInfo
  );

  public readonly airdropUserInfo$ = this._airdropUserInfo$.asObservable();

  constructor(private readonly apiService: AirdropApiService) {
    super();
    this.subscribeOnWalletChange();
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
        // @TODO refactoring _fetchError$ logic
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
}
