import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { map, startWith } from 'rxjs/operators';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { Observable } from 'rxjs';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { ERROR_TYPE } from '@features/swaps/shared/components/swap-button-container/models/error-type';
import { HeaderStore } from '@app/root-components/header/services/header.store';

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
    private readonly swapFormService: SwapFormService
  ) {}

  public allowChangeNetwork(err: ERROR_TYPE): boolean {
    if (err !== ERROR_TYPE.WRONG_BLOCKCHAIN) {
      return false;
    }
    return this.walletConnectorService?.provider.walletName === WALLET_NAME.METAMASK;
  }

  public async changeNetwork(): Promise<void> {
    this.loading = true;

    const { fromBlockchain } = this.swapFormService.inputValue;
    try {
      await this.walletConnectorService.switchChain(fromBlockchain);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  public isMinMaxError(err: ERROR_TYPE): boolean {
    return err === ERROR_TYPE.LESS_THAN_MINIMUM || err === ERROR_TYPE.MORE_THAN_MAXIMUM;
  }
}
