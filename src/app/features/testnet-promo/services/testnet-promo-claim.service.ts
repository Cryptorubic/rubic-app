import { Injectable } from '@angular/core';
import { AirdropNode } from '@features/airdrop/models/airdrop-node';
import { BLOCKCHAIN_NAME, CHAIN_TYPE, Injector } from '@cryptorubic/sdk';
import { airdropContractAbi } from '@features/airdrop/constants/airdrop-contract-abi';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';
import { GasService } from '@core/services/gas-service/gas.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClaimButtonState } from '@features/testnet-promo/interfaces/claim-button-state.interface';
import { TestnetPromoNotificationService } from '@features/testnet-promo/services/testnet-promo-notification.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

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
    private readonly notificationService: TestnetPromoNotificationService,
    private readonly walletConnectorService: WalletConnectorService
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
        this.checkBlockchain();
        await this.checkPause(contractAddress);
        await this.checkClaimed(contractAddress, node.index);
        await this.executeClaim(contractAddress, node, proof, () => {
          claimInProgressNotification = this.notificationService.showProgressNotification();
        });
        this._buttonStatus$.next('claimed');
        this.notificationService.showSuccessNotification();
      } catch (err) {
        this.notificationService.showErrorNotification(err);
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

  private checkBlockchain(): void {
    if (this.walletConnectorService.network !== BLOCKCHAIN_NAME.ARBITRUM) {
      throw new Error('wrong chain');
    }
  }
}
