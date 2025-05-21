import { Injectable } from '@angular/core';
import { AirdropNode } from '@features/airdrop/models/airdrop-node';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, Injector, UserRejectError } from 'rubic-sdk';
import { airdropContractAbi } from '@features/airdrop/constants/airdrop-contract-abi';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';
import { GasService } from '@core/services/gas-service/gas.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TuiNotification } from '@taiga-ui/core';
import { InsufficientFundsGasPriceValueError as SdkInsufficientFundsGasPriceValueError } from 'rubic-sdk/lib/common/errors/cross-chain/insufficient-funds-gas-price-value.error';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { map } from 'rxjs/operators';
import { ClaimButtonState } from '@features/testnet-promo/interfaces/claim-button-state.interface';

@Injectable()
export class TestnetPromoClaimService {
  private readonly _buttonStatus$ = new BehaviorSubject<ClaimButtonState>('loading');

  public readonly buttonState$ = this._buttonStatus$.asObservable();

  public readonly buttonLabel$ = this.buttonState$.pipe(
    map(state => {
      const stateLabelMap: Record<ClaimButtonState, string> = {
        active: 'Claim',
        loading: 'Loading',
        claimed: 'Claimed'
      };
      return stateLabelMap[state];
    })
  );

  constructor(
    private readonly gasService: GasService,
    private readonly translateService: TranslateService,
    private readonly notificationsService: NotificationsService
  ) {}

  public async setClaimStatus(contractAddress: string, nodeIndex: number): Promise<void> {
    try {
      const isClaimed = await this.checkClaimed(contractAddress, nodeIndex);
      this._buttonStatus$.next(isClaimed ? 'claimed' : 'active');
    } catch (err) {
      this._buttonStatus$.next('claimed');
    }
  }

  public async claimTokens(
    contractAddress: string,
    node: AirdropNode,
    proof: string[]
  ): Promise<void> {
    if (this._buttonStatus$.value === 'active') {
      this._buttonStatus$.next('loading');
      let claimInProgressNotification: Subscription;

      try {
        await this.checkPause(contractAddress);
        await this.checkClaimed(contractAddress, node.index);
        await this.executeClaim(contractAddress, node, proof, () => {
          claimInProgressNotification = this.showProgressNotification();
        });
        this._buttonStatus$.next('claimed');
        this.showSuccessNotification();
      } catch (err) {
        this.handleError(err);
        this._buttonStatus$.next('active');
      } finally {
        claimInProgressNotification?.unsubscribe();
      }
    }
  }

  private async executeClaim(
    contractAddress: string,
    node: AirdropNode,
    proof: string[],
    onTransactionHash: (hash: string) => void
  ): Promise<void> {
    const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      BLOCKCHAIN_NAME.ARBITRUM
    );

    await web3.executeContractMethod(
      contractAddress,
      airdropContractAbi,
      'claim',
      [node.index, node.account, node.amount, proof],
      {
        onTransactionHash,
        ...(shouldCalculateGasPrice && { gasPriceOptions })
      }
    );
  }

  private async checkPause(contractAddress: string): Promise<void> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(newRubicToken.blockchain)
      .callContractMethod(contractAddress, airdropContractAbi, 'paused', []);
    if (isPaused) {
      throw new Error('paused');
    }
  }

  public async checkClaimed(contractAddress: string, index: number): Promise<boolean> {
    const isPaused = await Injector.web3PublicService
      .getWeb3Public(newRubicToken.blockchain)
      .callContractMethod(contractAddress, airdropContractAbi, 'isClaimed', [index]);

    return Boolean(isPaused);
  }

  private showProgressNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant(`testnetPromo.notification.progress`),
      {
        status: TuiNotification.Info,
        autoClose: false,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      }
    );
  }

  private showSuccessNotification(): Subscription {
    return this.notificationsService.show(
      this.translateService.instant(`testnetPromo.notification.success`),
      {
        status: TuiNotification.Success,
        autoClose: 10000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      }
    );
  }

  private handleError(err: unknown): void {
    if (err instanceof Error) {
      let label: string;
      let status: TuiNotification;

      if (err.message === 'paused') {
        label = this.translateService.instant('testnetPromo.notification.paused');
        status = TuiNotification.Warning;
      } else if (err.message === 'claimed') {
        label = this.translateService.instant('testnetPromo.notification.claimed');
        status = TuiNotification.Warning;
      } else if (err.message.includes('User denied transaction signature')) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        status = TuiNotification.Error;
      } else {
        label = this.translateService.instant('testnetPromo.notification.unknown');
        status = TuiNotification.Error;
      }

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('testnetPromo.notification.reject');
        status = TuiNotification.Error;
      }

      if (err instanceof SdkInsufficientFundsGasPriceValueError) {
        label = this.translateService.instant('testnetPromo.notification.notEnoughBalance');
        status = TuiNotification.Error;
      }

      this.notificationsService.show(label, {
        autoClose: 10000,
        status,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    }
  }
}
