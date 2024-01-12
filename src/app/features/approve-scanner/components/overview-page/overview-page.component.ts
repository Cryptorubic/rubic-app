import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TuiDestroyService, tuiIsPresent } from '@taiga-ui/cdk';
import { first, switchMap, takeUntil } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ROUTE_PATH } from '@shared/constants/common/links';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class OverviewPageComponent {
  public readonly cards = [
    {
      image: 'assets/images/icons/approve-scanner-page/empty-wallet.png',
      label: 'Connect',
      description: 'Click Connect Wallet on the top right or just above this card.'
    },
    {
      image: 'assets/images/icons/approve-scanner-page/search-status.png',
      label: 'Inspect',
      description:
        'Inspect your allowances by using the network selection, sorting and filtering options.'
    },
    {
      image: 'assets/images/icons/approve-scanner-page/card-slash.png',
      label: 'Revoke',
      description:
        'Revoke the allowances that you no longer use to prevent unwanted access to your funds.'
    }
  ];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly router: Router
  ) {
    this.handleWalletChange();
  }

  private handleWalletChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        first(tuiIsPresent),
        takeUntil(this.destroy$),
        switchMap(() => this.router.navigateByUrl(`${ROUTE_PATH.REVOKE_APPROVAL}/revoke`))
      )
      .subscribe();
  }
}
