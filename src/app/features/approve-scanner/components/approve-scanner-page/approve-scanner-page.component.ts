import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { combineLatestWith, forkJoin, of } from 'rxjs';
import { first, map, switchMap, takeUntil } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { SdkService } from '@core/services/sdk/sdk.service';
import { Router } from '@angular/router';
import { TokensService } from '@core/services/tokens/tokens.service';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TuiDestroyService, tuiIsPresent } from '@taiga-ui/cdk';
import { nativeTokensList } from '@cryptorubic/sdk';

@Component({
  selector: 'app-approve-scanner-page',
  templateUrl: './approve-scanner-page.component.html',
  styleUrls: ['./approve-scanner-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class ApproveScannerPageComponent {
  public readonly address$ = this.walletConnectorService.addressChange$;

  public readonly userBalance$ = this.service.selectedBlockchain$.pipe(
    combineLatestWith(this.address$, this.tokensStoreService.tokens$.pipe(first(tuiIsPresent))),
    switchMap(([blockchain]) =>
      forkJoin([
        of(blockchain),
        this.tokensService.getAndUpdateTokenBalance(nativeTokensList[blockchain.key])
      ])
    ),
    map(([blockchain, balance]) => `${balance} ${nativeTokensList[blockchain.key].symbol}`)
  );

  public loading = false;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly service: ApproveScannerService,
    private readonly sdkService: SdkService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.handleUnlogin();
  }

  private handleUnlogin(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        first(address => address === null),
        takeUntil(this.destroy$),
        switchMap(() => this.router.navigateByUrl(ROUTE_PATH.REVOKE_APPROVAL))
      )
      .subscribe();
  }
}
