import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { combineLatestWith, firstValueFrom, lastValueFrom } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { EvmBlockchainName } from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';

@Component({
  selector: 'app-approve-scanner-page',
  templateUrl: './approve-scanner-page.component.html',
  styleUrls: ['./approve-scanner-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveScannerPageComponent {
  public readonly address$ = this.walletConnectorService.addressChange$;

  public readonly allowChangeBlockchain$ = this.walletConnectorService.networkChange$.pipe(
    combineLatestWith(this.service.selectedBlockchain$),
    map(([currentBlockchain, selectedBlockchain]) => currentBlockchain !== selectedBlockchain.key)
  );

  public readonly fromBlockchainLabel$ = this.service.selectedBlockchain$.pipe(
    map(blockchain => blockchainLabel[blockchain.key])
  );

  public loading = false;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly service: ApproveScannerService,
    private readonly sdkService: SdkService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public async changeNetwork(): Promise<void> {
    this.loading = true;
    try {
      const blockchain = await firstValueFrom(this.service.selectedBlockchain$);
      await this.walletConnectorService.switchChain(blockchain.key as EvmBlockchainName);
      await lastValueFrom(this.sdkService.sdkLoading$.pipe(first(el => el === false)));
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
