import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { ErrorsService } from '@core/errors/errors.service';
import BigNumber from 'bignumber.js';
import { first, map, startWith } from 'rxjs/operators';
import { combineLatestWith, firstValueFrom, lastValueFrom } from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { EvmBlockchainName } from '@cryptorubic/sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  public readonly allowChangeBlockchain$ = this.walletConnectorService.networkChange$.pipe(
    combineLatestWith(this.approveScannerService.selectedBlockchain$),
    map(([currentBlockchain, selectedBlockchain]) => currentBlockchain !== selectedBlockchain.key)
  );

  public readonly exceededLimits$ = this.approveScannerService.exceededLimits$;

  public readonly approves$ = this.approveScannerService.visibleApproves$.pipe(
    map(approves => {
      const maxApprove = new BigNumber(2).pow(256).minus(1);
      return approves.map(approve => ({
        ...approve,
        value: maxApprove.eq(approve.value) ? 'Unlimited' : approve.value
      }));
    })
  );

  public readonly allApproves$ = this.approveScannerService.allApproves$;

  public switchLoading = false;

  public readonly tableLoading$ = this.approveScannerService.tableLoading$;

  public readonly size$ = this.approveScannerService.size$;

  public set size(value: number) {
    this.approveScannerService.size = value;
  }

  public readonly page$ = this.approveScannerService.page$;

  public set page(value: number) {
    this.approveScannerService.page = value;
  }

  public readonly queryForm = this.approveScannerService.queryForm;

  public readonly selectedBlockchain$ =
    this.approveScannerService.form.controls.blockchain.valueChanges.pipe(
      startWith(this.approveScannerService.form.controls.blockchain.value)
    );

  constructor(
    private readonly approveScannerService: ApproveScannerService,
    private readonly errorsService: ErrorsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly sdkService: SdkService,
    @Inject(TUI_IS_MOBILE) public readonly isMobile: boolean
  ) {}

  public async handleRevoke({
    token,
    spender,
    callback
  }: {
    token: string;
    spender: string;
    callback: () => void;
  }): Promise<void> {
    try {
      await this.approveScannerService.revokeApprove(token, spender);
    } catch (err) {
      this.errorsService.catch(err);
    } finally {
      callback();
    }
  }

  public async changeNetwork(callback: () => void): Promise<void> {
    try {
      const blockchain = await firstValueFrom(this.approveScannerService.selectedBlockchain$);
      await this.walletConnectorService.switchChain(blockchain.key as EvmBlockchainName);
      await lastValueFrom(this.sdkService.sdkLoading$.pipe(first(el => el === false)));
    } catch (err) {
      this.errorsService.catch(err);
    } finally {
      callback();
    }
  }
}
