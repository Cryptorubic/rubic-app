import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { EvmBlockchainName } from 'rubic-sdk';
import { TokensService } from '@core/services/tokens/tokens.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { finalize, from, Observable } from 'rxjs';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { TokenApproveData } from '@features/approve-scanner/models/token-approve-data';
import { watch } from '@taiga-ui/cdk';

interface ContextData {
  spenderAddress: string;
  tokenAddress: string;
  blockchain: EvmBlockchainName;
}

@Component({
  selector: 'app-revoke-modal',
  templateUrl: './revoke-modal.component.html',
  styleUrls: ['./revoke-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevokeModalComponent {
  private readonly spenderAddress = this.context.data.spenderAddress;

  private readonly tokenAddress = this.context.data.tokenAddress;

  private readonly blockchain = this.context.data.blockchain;

  public readonly approveData$: Observable<TokenApproveData> = from(
    this.approveScannerService.fetchApproveTokenData(this.tokenAddress, this.spenderAddress)
  ).pipe(
    watch(this.cdr),
    finalize(() => {
      this.informationLoading = false;
      this.revokeLoading = false;
    })
  );

  public revokeLoading = true;

  public informationLoading = true;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, ContextData>,
    private readonly tokensService: TokensService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly approveScannerService: ApproveScannerService
  ) {}

  public async handleRevoke(): Promise<void> {
    this.revokeLoading = true;
    await this.approveScannerService.revokeApprove(this.tokenAddress, this.spenderAddress);
    this.revokeLoading = false;
  }
}
