import { first } from 'rxjs/operators';
import { BehaviorSubject, lastValueFrom, Subscription } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SwapAndEarnPopupService } from '@features/swap-and-earn/services/swap-and-earn-popup.service';
import { SwapAndEarnWeb3Service } from '@features/swap-and-earn/services/swap-and-earn-web3.service';
import { SwapAndEarnMerkleService } from '@features/swap-and-earn/services/swap-and-earn-merkle.service';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { SdkService } from '@core/services/sdk/sdk.service';
import { Web3Pure } from 'rubic-sdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { AirdropMerkleService } from '@features/swap-and-earn/services/airdrop-service/airdrop-merkle.service';
import { RetrodropMerkleService } from '@features/swap-and-earn/services/retrodrop-service/retrodrop-merkle.service';
import sourceAirdropMerkle from '@features/swap-and-earn/constants/airdrop/airdrop-merkle-tree.json';
import sourceRetrodropMerkle from '@features/swap-and-earn/constants/retrodrop/retrodrop-merkle-tree.json';
import { Injectable } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

@Injectable()
export class SwapAndEarnFacadeService {
  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  private readonly _isValid$ = new BehaviorSubject(false);

  public readonly isValid$ = this._isValid$.asObservable();

  private readonly _isAlreadyClaimed$ = new BehaviorSubject(false);

  public readonly isAlreadyClaimed$ = this._isAlreadyClaimed$.asObservable();

  private readonly _claimedTokens$ = new BehaviorSubject(new BigNumber(0));

  public readonly claimedTokens$ = this._claimedTokens$.asObservable();

  protected readonly claims: {
    [Key: string]: {
      index: number;
      amount: string;
      proof: string[];
    };
  } =
    this.swapAndEarnStateService.currentTab === 'airdrop'
      ? sourceAirdropMerkle.claims
      : sourceRetrodropMerkle.claims;

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly notificationsService: NotificationsService,
    private readonly sdkService: SdkService,
    private readonly popupService: SwapAndEarnPopupService,
    private readonly web3Service: SwapAndEarnWeb3Service,
    private readonly swapAndEarnStateService: SwapAndEarnStateService,
    private readonly airdropMerkleService: AirdropMerkleService,
    private readonly retrodropMerkleService: RetrodropMerkleService
  ) {
    this.subscribeOnWalletChange();
  }

  public get merkleService(): SwapAndEarnMerkleService {
    return this.swapAndEarnStateService.currentTab === 'airdrop'
      ? this.airdropMerkleService
      : this.retrodropMerkleService;
  }

  private subscribeOnWalletChange(): void {
    this.authService.currentUser$?.subscribe(user => {
      if (!user || !user.address) {
        this._isAlreadyClaimed$.next(false);
        this._isValid$.next(false);
        return null;
      }

      const userAddress = user.address.toLowerCase();

      this._claimedTokens$.next(
        Web3Pure.fromWei(this.merkleService.getAmountByAddress(userAddress).toString())
      );

      this.isValidAddress(userAddress);
      this.isAlreadyClaimed(userAddress);
    });
  }

  private isValidAddress(userAddress: string): void {
    this._isValid$.next(
      Object.keys(this.claims).some(address => userAddress === address.toLowerCase())
    );
  }

  private async isAlreadyClaimed(userAddress: string): Promise<void> {
    const node = this.merkleService.getNodeByAddress(userAddress);
    try {
      await this.web3Service.checkClaimed(node.index);
      this._isAlreadyClaimed$.next(false);
    } catch (err) {
      this._isAlreadyClaimed$.next(true);
    }
  }

  public async claimTokens(): Promise<void> {
    this._claimLoading$.next(true);
    let claimInProgressNotification: Subscription;

    try {
      await this.web3Service.checkPause();

      const address = this.walletConnectorService.address;
      const node = this.merkleService.getNodeByAddress(address);
      const proof = this.merkleService.getProofByAddress(address);

      await this.web3Service.checkClaimed(node.index);

      await this.web3Service.executeClaim(node, proof, hash => {
        this.popupService.showSuccessModal(hash);
        claimInProgressNotification = this.popupService.showProgressNotification();
      });
      this.popupService.showSuccessNotification();
      this.isAlreadyClaimed(address);
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
