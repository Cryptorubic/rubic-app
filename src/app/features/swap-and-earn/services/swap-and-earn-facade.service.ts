import { first, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatestWith, forkJoin, lastValueFrom, Subscription } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SwapAndEarnPopupService } from '@features/swap-and-earn/services/swap-and-earn-popup.service';
import { SwapAndEarnWeb3Service } from '@features/swap-and-earn/services/swap-and-earn-web3.service';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { SdkService } from '@core/services/sdk/sdk.service';
import { Web3Pure } from 'rubic-sdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { Injectable } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { Router } from '@angular/router';
import { MerkleTree } from '@features/swap-and-earn/models/merkle-tree';
import { HttpClient } from '@angular/common/http';
import { SwapAndEarnMerkleService } from '@features/swap-and-earn/services/swap-and-earn-merkle.service';
import { SwapAndEarnApiService } from '@features/swap-and-earn/services/swap-and-earn-api.service';

@Injectable()
export class SwapAndEarnFacadeService {
  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  private readonly _isAirdropAddressValid$ = new BehaviorSubject(false);

  public readonly isAirdropAddressValid$ = this._isAirdropAddressValid$.asObservable();

  private readonly _isRetrodropAddressValid$ = new BehaviorSubject(false);

  public readonly isRetrodropAddressValid$ = this._isRetrodropAddressValid$.asObservable();

  private readonly _isAlreadyClaimed$ = new BehaviorSubject(false);

  public readonly isAlreadyClaimed$ = this._isAlreadyClaimed$.asObservable();

  private readonly _claimedTokens$ = new BehaviorSubject(new BigNumber(0));

  public readonly claimedTokens$ = this._claimedTokens$.asObservable();

  private readonly _treesLoading$ = new BehaviorSubject<boolean>(true);

  public readonly treesLoading$ = this._treesLoading$.asObservable();

  private retrodropTree: MerkleTree | null = null;

  private airdropTree: MerkleTree | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly notificationsService: NotificationsService,
    private readonly sdkService: SdkService,
    private readonly popupService: SwapAndEarnPopupService,
    private readonly web3Service: SwapAndEarnWeb3Service,
    private readonly stateService: SwapAndEarnStateService,
    private readonly router: Router,
    private readonly httpClient: HttpClient,
    private readonly merkleService: SwapAndEarnMerkleService,
    private readonly apiService: SwapAndEarnApiService
  ) {
    this.fetchTrees();
    this.subscribeOnWalletChange();
    this.subscribeOnTabChange();
  }

  private subscribeOnWalletChange(): void {
    this.authService.currentUser$
      .pipe(
        combineLatestWith(this.treesLoading$.pipe(first(loading => loading === false))),
        switchMap(([user]) => {
          const userAddress = user?.address?.toLowerCase();

          if (!user || !userAddress) {
            this.setEmptyData();
            return;
          }

          const tree =
            this.stateService.currentTab === 'retrodrop' ? this.retrodropTree : this.airdropTree;
          const userClaimAmount = this.merkleService.getAmountByAddress(userAddress, tree);

          this._claimedTokens$.next(Web3Pure.fromWei(userClaimAmount.toString()));

          this.setAirdropValidAddress(userAddress, tree);
          this.setRetrodropValidAddress(userAddress, tree);

          return this.setAlreadyClaimed(userAddress, tree);
        })
      )
      .subscribe();
  }

  private subscribeOnTabChange(): void {
    this.stateService.currentTab$
      .pipe(
        combineLatestWith(this.treesLoading$.pipe(first(loading => loading === false))),
        switchMap(([tab]) => {
          const userAddress = this.authService.userAddress.toLowerCase();
          const tree = tab === 'retrodrop' ? this.retrodropTree : this.airdropTree;

          const userClaimAmount = this.merkleService.getAmountByAddress(userAddress, tree);
          this._claimedTokens$.next(Web3Pure.fromWei(userClaimAmount.toString()));

          return this.setAlreadyClaimed(userAddress, tree);
        })
      )
      .subscribe();
  }

  private setAirdropValidAddress(userAddress: string, merkleTree: MerkleTree): void {
    const isValid = Object.keys(merkleTree.claims).some(
      address => userAddress === address.toLowerCase()
    );
    this._isAirdropAddressValid$.next(isValid);
  }

  private setRetrodropValidAddress(userAddress: string, merkleTree: MerkleTree): void {
    const isValid = Object.keys(merkleTree.claims).some(
      address => userAddress === address.toLowerCase()
    );

    this._isRetrodropAddressValid$.next(isValid);
  }

  private async setAlreadyClaimed(userAddress: string, tree: MerkleTree): Promise<void> {
    const node = this.merkleService.getNodeByAddress(userAddress, tree);
    try {
      await this.web3Service.checkClaimed(node.index);
      this._isAlreadyClaimed$.next(false);
    } catch (err) {
      this._isAlreadyClaimed$.next(true);
    }
  }

  public async claimTokens(
    showSuccessModal: boolean = true,
    navigateToStaking: boolean = false
  ): Promise<void> {
    this._claimLoading$.next(true);
    let claimInProgressNotification: Subscription;

    try {
      await this.web3Service.checkPause();

      const address = this.walletConnectorService.address;
      const tree =
        this.stateService.currentTab === 'retrodrop' ? this.retrodropTree : this.airdropTree;

      const node = this.merkleService.getNodeByAddress(address, tree);
      const proof = this.merkleService.getProofByAddress(address, tree);

      await this.web3Service.checkClaimed(node.index);

      await this.web3Service.executeClaim(node, proof, hash => {
        if (showSuccessModal) {
          this.popupService.showSuccessModal(hash);
        }
        if (navigateToStaking) {
          this.router.navigateByUrl(ROUTE_PATH.STAKING);
        }
        claimInProgressNotification = this.popupService.showProgressNotification();
      });
      this.popupService.showSuccessNotification();
      await this.setAlreadyClaimed(address, tree);
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

  private setEmptyData(): void {
    this._isAlreadyClaimed$.next(false);
    this._isAirdropAddressValid$.next(false);
    this._isRetrodropAddressValid$.next(false);
  }

  private fetchTrees(): void {
    forkJoin([this.apiService.fetchRetrodropTree(), this.apiService.fetchAirdropTree()])
      .pipe(
        tap(([retrodropTree, airdropTree]) => {
          this.retrodropTree = retrodropTree;
          this.airdropTree = airdropTree;
          this._treesLoading$.next(false);
        })
      )
      .subscribe();
  }
}
