import { Injectable } from '@angular/core';
import { Web3Pure } from 'rubic-sdk';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { checkAddressValidity } from '@features/swap-and-earn/utils/merkle-tree-address-validation';
import { filter, first, map } from 'rxjs/operators';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TranslateService } from '@ngx-translate/core';
import { compareAddresses } from '@shared/utils/utils';
import { AirdropPopupService } from '@features/swap-and-earn/services/airdrop/airdrop-popup.service';
import { AirdropWeb3Service } from '@features/swap-and-earn/services/airdrop/airdrop-web3.service';
import { AirdropMerkleService } from '@features/swap-and-earn/services/airdrop/airdrop-merkle.service';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { SdkService } from '@app/core/services/sdk/sdk.service';

@Injectable()
export class AirdropFacadeService {
  private readonly _claimLoading$ = new BehaviorSubject(false);

  public readonly claimLoading$ = this._claimLoading$.asObservable();

  public readonly airdropForm = new FormGroup({
    address: new FormControl<string>(null, [
      Validators.required,
      checkAddressValidity(this.merkleService)
    ])
  });

  public readonly claimedTokens$ = this.airdropForm.controls.address.valueChanges.pipe(
    filter(() => this.airdropForm.controls.address.valid),
    map(address => {
      const amount = this.merkleService.getAmountByAddress(address);
      return Web3Pure.fromWei(amount.toString());
    })
  );

  public readonly isValid$ = this.airdropForm.controls.address.valueChanges.pipe(
    map(() => this.airdropForm.controls.address.valid)
  );

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly sdkService: SdkService,
    private readonly translateService: TranslateService,
    private readonly popupService: AirdropPopupService,
    private readonly web3Service: AirdropWeb3Service,
    private readonly merkleService: AirdropMerkleService
  ) {}

  public async claimTokens(): Promise<void> {
    this._claimLoading$.next(true);
    let claimInProgressNotification: Subscription;

    try {
      await this.web3Service.checkPause();
      await this.checkAddress();

      const address = this.airdropForm.controls.address.value;
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

  private async checkAddress(): Promise<void> {
    const claimAddress = this.airdropForm.controls.address.value;
    const userAddress = this.walletConnectorService.address;
    if (!compareAddresses(claimAddress, userAddress)) {
      try {
        const isUserAgreed = await firstValueFrom(this.popupService.showWarningModal());
        if (!isUserAgreed) {
          throw new Error();
        }
      } catch {
        throw new Error('User does not agree to claim tokens');
      }
    }
  }
}
