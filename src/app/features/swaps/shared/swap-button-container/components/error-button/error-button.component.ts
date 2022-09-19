import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/swap-button-container/services/swap-button-container-errors.service';
import { HeaderStore } from '@core/header/services/header.store';
import { ERROR_TYPE } from '@features/swaps/shared/swap-button-container/models/error-type';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { SwapButtonContainerService } from '@features/swaps/shared/swap-button-container/services/swap-button-container.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { first, map, startWith } from 'rxjs/operators';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { lastValueFrom, Observable } from 'rxjs';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';

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

  public get fromBlockchain$(): Observable<BlockchainName> {
    return this.swapFormService.inputValueChanges.pipe(
      startWith(this.swapFormService.inputValue),
      map(form => form.fromBlockchain)
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly swapFormService: SwapFormService,
    private readonly sdkService: RubicSdkService
  ) {}

  public allowChangeNetwork(err: ERROR_TYPE): boolean {
    const { fromBlockchain } = this.swapFormService.inputValue;
    if (err !== ERROR_TYPE.WRONG_BLOCKCHAIN || fromBlockchain === BLOCKCHAIN_NAME.BITCOIN) {
      return false;
    }

    return (
      this.walletConnectorService?.provider.walletName === WALLET_NAME.METAMASK ||
      this.walletConnectorService?.provider.walletName === WALLET_NAME.WALLET_CONNECT
    );
  }

  public async changeNetwork(): Promise<void> {
    this.loading = true;

    const { fromBlockchain } = this.swapFormService.inputValue;
    try {
      await this.walletConnectorService.switchChain(fromBlockchain);
      await lastValueFrom(this.sdkService.sdkLoading$.pipe(first(el => el === false)));
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  public isMinMaxError(err: ERROR_TYPE): boolean {
    return err === ERROR_TYPE.LESS_THAN_MINIMUM || err === ERROR_TYPE.MORE_THAN_MAXIMUM;
  }
}
