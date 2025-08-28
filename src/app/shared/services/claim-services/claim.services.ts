import { BehaviorSubject, combineLatestWith, lastValueFrom, Subscription } from 'rxjs';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { ClaimWeb3Service } from '@shared/services/claim-services/claim-web3.service';
import { ClaimPopupService } from '@shared/services/claim-services/claim-popup.service';
import { Router } from '@angular/router';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';
import { first, map, tap } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { SdkService } from '@core/services/sdk/sdk.service';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { inject, Injectable } from '@angular/core';
import { ClaimRound } from '@shared/models/claim/claim-round';
import { AuthService } from '@core/services/auth/auth.service';
import { BlockchainName } from '@cryptorubic/sdk';

@Injectable({ providedIn: 'root' })
export abstract class ClaimService {
  protected readonly claimWeb3Service = inject(ClaimWeb3Service);

  protected readonly claimPopupService = inject(ClaimPopupService);

  protected readonly walletConnectorService = inject(WalletConnectorService);

  protected readonly sdkService = inject(SdkService);

  protected readonly router = inject(Router);

  protected readonly authService = inject(AuthService);

  protected readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  protected readonly _fetchUserInfoLoading$ = new BehaviorSubject(false);

  public readonly fetchUserInfoLoading$ = this._fetchUserInfoLoading$.asObservable();

  protected readonly _fetchError$ = new BehaviorSubject<boolean>(false);

  public readonly fetchError$ = this._fetchError$.asObservable();

  protected readonly _rounds$ = new BehaviorSubject<ClaimRound[]>([]);

  public readonly rounds$ = this._rounds$.asObservable();

  public readonly currentUser$ = this.authService.currentUser$;

  public set claimLoading(isLoading: boolean) {
    this._claimLoading$.next(isLoading);
  }

  protected subscribeOnWalletChange(): void {
    this.authService.currentUser$
      .pipe(
        combineLatestWith(this.walletConnectorService.networkChange$),
        tap(([user, network]) => {
          if (!user || !user.address) {
            return null;
          }

          this.setUserInfo(network, user.address);
        })
      )
      .subscribe();
  }

  protected abstract setUserInfo(network: BlockchainName, address: string): void;

  public async claimTokens(
    claimData: ClaimTokensData,
    roundNumber: number,
    showSuccessModal: boolean = true,
    navigateToStaking: boolean = false
  ): Promise<void> {
    this.claimLoading = true;
    let claimInProgressNotification: Subscription;

    try {
      await this.claimWeb3Service.checkPause(claimData.contractAddress);
      await this.claimWeb3Service.checkClaimed(claimData.contractAddress, claimData.node.index);
      await this.claimWeb3Service.executeClaim(
        claimData.contractAddress,
        claimData.node,
        claimData.proof,
        hash => {
          if (showSuccessModal) {
            this.claimPopupService.showSuccessModal(hash);
          }

          if (navigateToStaking) {
            this.router.navigateByUrl(ROUTE_PATH.STAKING);
          }

          claimInProgressNotification = this.claimPopupService.showProgressNotification(
            navigateToStaking ? 'retrodrop' : 'airdrop'
          );
        }
      );

      this.claimPopupService.showSuccessNotification(navigateToStaking ? 'retrodrop' : 'airdrop');

      this.updateRound(roundNumber);
    } catch (err) {
      this.claimPopupService.handleError(err);
    } finally {
      claimInProgressNotification?.unsubscribe();
      this.claimLoading = false;
    }
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

  public async changeNetwork(): Promise<void> {
    this.claimLoading = true;
    try {
      await this.walletConnectorService.switchChain(newRubicToken.blockchain);
      await lastValueFrom(this.sdkService.sdkLoading$.pipe(first(el => el === false)));
    } finally {
      this.claimLoading = false;
    }
  }
}
