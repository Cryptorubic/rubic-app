import { first, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, lastValueFrom, Subscription } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SwapAndEarnPopupService } from '@features/swap-and-earn/services/swap-and-earn-popup.service';
import { SwapAndEarnWeb3Service } from '@features/swap-and-earn/services/swap-and-earn-web3.service';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { SdkService } from '@core/services/sdk/sdk.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { Injectable } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { AirdropNode } from '@features/swap-and-earn/models/airdrop-node';
import { SwapAndEarnApiService } from '@features/swap-and-earn/services/swap-and-earn-api.service';
import { airdropContractAddress } from '@features/swap-and-earn/constants/airdrop/airdrop-contract-address';
import { retrodropContractAddress } from '@features/swap-and-earn/constants/retrodrop/retrodrop-contract-address';

@Injectable({ providedIn: 'root' })
export class SwapAndEarnFacadeService {
  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  private readonly _airdropAndRetrodropFetchLoading$ = new BehaviorSubject(false);

  public readonly airdropAndRetrodropFetchLoading$ =
    this._airdropAndRetrodropFetchLoading$.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly notificationsService: NotificationsService,
    private readonly sdkService: SdkService,
    private readonly popupService: SwapAndEarnPopupService,
    private readonly web3Service: SwapAndEarnWeb3Service,
    private readonly swapAndEarnStateService: SwapAndEarnStateService,
    private readonly swapAndEarnApiService: SwapAndEarnApiService,
    private readonly router: Router
  ) {
    this.subscribeOnWalletChange();
  }

  private subscribeOnWalletChange(): void {
    this.authService.currentUser$?.subscribe(user => {
      if (!user || !user.address) {
        this.swapAndEarnStateService.isAirdropRoundAlreadyClaimed = false;
        this.swapAndEarnStateService.isRetrodropRoundsAlreadyClaimed = Array(12).fill(false);
        return null;
      }

      this.setRetrodropAndSwapToEarnUserInfo();
    });
  }

  public async setAlreadyAirdropClaimed(): Promise<void> {
    try {
      await this.web3Service.checkClaimed(
        airdropContractAddress,
        this.swapAndEarnStateService.airdropUserClaimInfo.index
      );
      this.swapAndEarnStateService.isAirdropRoundAlreadyClaimed = false;
    } catch (err) {
      this.swapAndEarnStateService.isAirdropRoundAlreadyClaimed = true;
    }
  }

  public async setAlreadyRetrodropClaimed(): Promise<void> {
    const alreadyClaimedRounds = this.swapAndEarnStateService.retrodropUserInfo.map(userInfo =>
      this.web3Service
        .checkClaimed(retrodropContractAddress, userInfo.index)
        .then(() => ({
          round: userInfo.round,
          isClaimed: false
        }))
        .catch(() => ({
          round: userInfo.round,
          isClaimed: true
        }))
    );

    this.swapAndEarnStateService.isRetrodropRoundsAlreadyClaimed = await Promise.all(
      alreadyClaimedRounds
    );
  }

  private setRetrodropAndSwapToEarnUserInfo(): void {
    this._airdropAndRetrodropFetchLoading$.next(true);
    forkJoin([
      this.swapAndEarnApiService.fetchRetrodropUserInfo(),
      this.swapAndEarnApiService.fetchSwapToEarnUserClaimInfo()
    ])
      .pipe(
        tap(([retrodropUserInfo, swapToEarnUserClaimInfo]) => {
          this.swapAndEarnStateService.airdropUserClaimInfo = swapToEarnUserClaimInfo;
          this.swapAndEarnStateService.retrodropUserInfo = retrodropUserInfo;
        })
      )
      .subscribe(() => {
        this.setAlreadyAirdropClaimed();
        this.setAlreadyRetrodropClaimed();
        this.swapAndEarnStateService.setClaimedTokens();
        this.swapAndEarnStateService.setRetrodropRoundsAddressValid();
        this.swapAndEarnStateService.isUserParticipantOfSwapAndEarn =
          this.swapAndEarnStateService.airdropUserClaimInfo.is_participant;
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

    if (this.swapAndEarnStateService.currentTab === 'airdrop') {
      contractAddress = airdropContractAddress;
    } else {
      contractAddress = retrodropContractAddress;
    }

    try {
      await this.web3Service.checkPause(contractAddress);
      let node: AirdropNode;
      let proof: string[];

      if (this.swapAndEarnStateService.currentTab === 'airdrop') {
        node = {
          index: this.swapAndEarnStateService.airdropUserClaimInfo.index,
          account: this.swapAndEarnStateService.airdropUserClaimInfo.address,
          amount: EthersBigNumber.from(this.swapAndEarnStateService.airdropUserClaimInfo.amount)
        };
        proof = this.swapAndEarnStateService.airdropUserClaimInfo.proof;
      } else {
        node = {
          index: this.swapAndEarnStateService.retrodropUserInfo[0].index,
          account: this.swapAndEarnStateService.retrodropUserInfo[0].address,
          amount: EthersBigNumber.from(this.swapAndEarnStateService.retrodropUserInfo[0].amount)
        };
        proof = this.swapAndEarnStateService.retrodropUserInfo[retrodropClaimedRound].proof;
      }

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

      await this.setAlreadyAirdropClaimed();
      await this.setAlreadyRetrodropClaimed();
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
