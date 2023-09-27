import { BehaviorSubject, lastValueFrom, Subscription } from 'rxjs';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { ClaimWeb3Service } from '@shared/services/token-distribution-services/claim-web3.service';
import { ClaimPopupService } from '@shared/services/token-distribution-services/claim-popup.service';
import { Router } from '@angular/router';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';
import { first } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { SdkService } from '@core/services/sdk/sdk.service';
import { ClaimTokensData } from '@shared/models/claim/claim-tokens-data';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  constructor(
    private readonly claimWeb3Service: ClaimWeb3Service,
    private readonly claimPopupService: ClaimPopupService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly sdkService: SdkService,
    private readonly router: Router
  ) {}

  public async claimTokens(
    claimData: ClaimTokensData,
    showSuccessModal: boolean = true,
    navigateToStaking: boolean = false
  ): Promise<void> {
    this._claimLoading$.next(true);
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

      // await this.airdropStateService.setAlreadyAirdropClaimed();
      // await this.airdropStateService.setAlreadyRetrodropClaimed();
    } catch (err) {
      this.claimPopupService.handleError(err);
    } finally {
      claimInProgressNotification?.unsubscribe();
      this._claimLoading$.next(false);
    }
  }

  public async changeNetwork(): Promise<void> {
    this._claimLoading$.next(true);
    try {
      await this.walletConnectorService.switchChain(newRubicToken.blockchain);
      await lastValueFrom(this.sdkService.sdkLoading$.pipe(first(el => el === false)));
    } finally {
      this._claimLoading$.next(false);
    }
  }
}
