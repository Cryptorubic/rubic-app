import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';
import { HeaderStore } from '@core/header/services/header.store';
import { BUTTON_ERROR_TYPE } from '@features/swaps/shared/components/swap-button-container/models/button-error-type';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { first, map } from 'rxjs/operators';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { lastValueFrom } from 'rxjs';
import { SdkService } from '@core/services/sdk/sdk.service';
import { blockchainLabel } from '@app/shared/constants/blockchain/blockchain-label';

@Component({
  selector: 'app-error-button',
  templateUrl: './error-button.component.html',
  styleUrls: ['./error-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorButtonComponent {
  public readonly error$ = this.swapButtonContainerErrorsService.error$;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public loading = false;

  public readonly fromBlockchainLabel$ = this.swapFormService.fromBlockchain$.pipe(
    map(fromBlockchain => blockchainLabel[fromBlockchain])
  );

  public readonly currentWalletProvider$ = this.walletConnectorService.currentWalletName$;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly swapFormService: SwapFormService,
    private readonly sdkService: SdkService
  ) {}

  public allowChangeNetwork(err: BUTTON_ERROR_TYPE): boolean {
    const { fromAssetType } = this.swapFormService.inputValue;
    const fromBlockchain = fromAssetType as BlockchainName;
    if (
      err !== BUTTON_ERROR_TYPE.WRONG_BLOCKCHAIN ||
      !BlockchainsInfo.isEvmBlockchainName(fromBlockchain)
    ) {
      return false;
    }

    return (
      this.walletConnectorService?.provider.walletName === WALLET_NAME.METAMASK ||
      this.walletConnectorService?.provider.walletName === WALLET_NAME.BITKEEP ||
      this.walletConnectorService?.provider.walletName === WALLET_NAME.WALLET_CONNECT
    );
  }

  public async changeNetwork(): Promise<void> {
    const { fromAssetType } = this.swapFormService.inputValue;
    const fromBlockchain = fromAssetType as BlockchainName;
    if (!BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
      return;
    }

    this.loading = true;
    try {
      await this.walletConnectorService.switchChain(fromBlockchain);
      await lastValueFrom(this.sdkService.sdkLoading$.pipe(first(el => el === false)));
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  public isMinMaxError(err: BUTTON_ERROR_TYPE): boolean {
    return (
      err === BUTTON_ERROR_TYPE.LESS_THAN_MINIMUM || err === BUTTON_ERROR_TYPE.MORE_THAN_MAXIMUM
    );
  }
}
