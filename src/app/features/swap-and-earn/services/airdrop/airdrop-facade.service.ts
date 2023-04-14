import { Injectable } from '@angular/core';
import { Web3Pure } from 'rubic-sdk';
import { first } from 'rxjs/operators';
import { BehaviorSubject, lastValueFrom, of, Subscription } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AirdropPopupService } from '@features/swap-and-earn/services/airdrop/airdrop-popup.service';
import { AirdropWeb3Service } from '@features/swap-and-earn/services/airdrop/airdrop-web3.service';
import { AirdropMerkleService } from '@features/swap-and-earn/services/airdrop/airdrop-merkle.service';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { SdkService } from '@app/core/services/sdk/sdk.service';
import sourceAirdropMerkle from '@features/swap-and-earn/constants/airdrop/airdrop-merkle-tree.json';

@Injectable()
export class AirdropFacadeService {
  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  private readonly claims: {
    [Key: string]: {
      index: number;
      amount: string;
      proof: string[];
    };
  } = sourceAirdropMerkle.claims;

  public readonly claimedTokens$ = Web3Pure.fromWei(
    this.merkleService.getAmountByAddress(this.walletConnectorService.address).toString()
  );

  public readonly isValid$ = of(
    Object.keys(this.claims).some(
      address => this.walletConnectorService.address.toLowerCase() === address.toLowerCase()
    )
  );

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly sdkService: SdkService,
    private readonly popupService: AirdropPopupService,
    private readonly web3Service: AirdropWeb3Service,
    private readonly merkleService: AirdropMerkleService
  ) {}

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
