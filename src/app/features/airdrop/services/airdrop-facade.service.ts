import { first, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, lastValueFrom, Subscription } from 'rxjs';
import { AirdropPopupService } from '@features/airdrop/services/airdrop-popup.service';
import { AirdropWeb3Service } from '@features/airdrop/services/airdrop-web3.service';
import { newRubicToken } from '@features/airdrop/constants/airdrop/airdrop-token';
import { SdkService } from '@core/services/sdk/sdk.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { Injectable } from '@angular/core';
import { AirdropStateService } from '@features/airdrop/services/airdrop-state.service';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { AirdropNode } from '@features/airdrop/models/airdrop-node';
import { AirdropApiService } from '@features/airdrop/services/airdrop-api.service';
import { airdropContractAddress } from '@features/airdrop/constants/airdrop/airdrop-contract-address';
import { retrodropContractAddress } from '@features/retrodrop/constants/retrodrop-contract-address';

@Injectable({ providedIn: 'root' })
export class AirdropFacadeService {
  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  private readonly _airdropAndRetrodropFetchLoading$ = new BehaviorSubject(false);

  public readonly airdropAndRetrodropFetchLoading$ =
    this._airdropAndRetrodropFetchLoading$.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly sdkService: SdkService,
    private readonly popupService: AirdropPopupService,
    private readonly web3Service: AirdropWeb3Service,
    private readonly airdropStateService: AirdropStateService,
    private readonly airdropApiService: AirdropApiService,
    private readonly router: Router
  ) {
    this.subscribeOnWalletChange();
  }

  private subscribeOnWalletChange(): void {
    this.authService.currentUser$?.subscribe(user => {
      if (!user || !user.address) {
        this.airdropStateService.isAirdropRoundAlreadyClaimed = false;
        this.airdropStateService.isRetrodropRoundsAlreadyClaimed = Array(12).fill(false);
        return null;
      }

      this.setRetrodropAndSwapToEarnUserInfo();
    });
  }

  private setRetrodropAndSwapToEarnUserInfo(): void {
    this._airdropAndRetrodropFetchLoading$.next(true);
    forkJoin([
      this.airdropApiService.fetchRetrodropUserInfo(),
      this.airdropApiService.fetchAirdropUserClaimInfo()
    ])
      .pipe(
        tap(([retrodropUserInfo, swapToEarnUserClaimInfo]) => {
          this.airdropStateService.airdropUserClaimInfo = swapToEarnUserClaimInfo;
          this.airdropStateService.retrodropUserInfo = retrodropUserInfo;
        })
      )
      .subscribe(() => {
        this.airdropStateService.setAlreadyAirdropClaimed();
        this.airdropStateService.setAlreadyRetrodropClaimed();

        this.airdropStateService.setClaimedTokens();

        this.airdropStateService.setRetrodropRoundsAddressValid();
        this.airdropStateService.isUserParticipantOfSwapAndEarn =
          this.airdropStateService.airdropUserClaimInfo.is_participant;

        this._airdropAndRetrodropFetchLoading$.next(false);
      });
  }

  public async claimTokens(
    retrodropClaimedRound: number = 1,
    showSuccessModal: boolean = true,
    navigateToStaking: boolean = false
  ): Promise<void> {
    this._claimLoading$.next(true);
    let claimInProgressNotification: Subscription;
    let contractAddress: string;
    let node: AirdropNode;
    let proof: string[];

    if ('airdrop' === 'airdrop') {
      contractAddress = airdropContractAddress;
      node = {
        index: this.airdropStateService.airdropUserClaimInfo.index,
        account: this.airdropStateService.airdropUserClaimInfo.address,
        amount: EthersBigNumber.from(this.airdropStateService.airdropUserClaimInfo.amount)
      };
      proof = this.airdropStateService.airdropUserClaimInfo.proof;
    } else {
      contractAddress = retrodropContractAddress[retrodropClaimedRound - 1];
      node = {
        index: this.airdropStateService.retrodropUserInfo[retrodropClaimedRound - 1].index,
        account: this.airdropStateService.retrodropUserInfo[retrodropClaimedRound - 1].address,
        amount: EthersBigNumber.from(
          this.airdropStateService.retrodropUserInfo[retrodropClaimedRound - 1].amount
        )
      };
      proof = this.airdropStateService.retrodropUserInfo[retrodropClaimedRound - 1].proof;
    }

    try {
      await this.web3Service.checkPause(contractAddress);
      await this.web3Service.checkClaimed(contractAddress, node.index);
      await this.web3Service.executeClaim(contractAddress, node, proof, hash => {
        if (showSuccessModal) {
          this.popupService.showSuccessModal(hash);
        }

        if (navigateToStaking) {
          this.router.navigateByUrl(ROUTE_PATH.STAKING);
        }

        claimInProgressNotification = this.popupService.showProgressNotification();
      });

      this.popupService.showSuccessNotification();

      await this.airdropStateService.setAlreadyAirdropClaimed();
      await this.airdropStateService.setAlreadyRetrodropClaimed();
    } catch (err) {
      this.popupService.handleError(err);
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
