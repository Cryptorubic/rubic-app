import { ChangeDetectionStrategy, Component, OnInit, Self, inject } from '@angular/core';
import { takeUntil } from 'rxjs';
import { PRIVACYCASH_PAGES } from '../../constants/privacycash-steps';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { EphemeralWalletTokensService } from '../../services/common/token-facades/ephemeral-wallet-tokens.service';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';

@Component({
  selector: 'app-privacy-cash-view',
  templateUrl: './privacycash-main-page.component.html',
  styleUrls: ['./privacycash-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class PrivacycashMainPageComponent implements OnInit {
  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly ephemeralWalletTokensService = inject(EphemeralWalletTokensService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = PRIVACYCASH_PAGES;

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privatePageTypeService: PrivatePageTypeService
  ) {
    this.privatePageTypeService.activePage = this.pages[0];
  }

  ngOnInit(): void {
    this.walletConnectorService.addressChange$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.privacycashTokensService.updatePrivateBalances();
    });
    this.privacycashTokensService.updateBalances$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.privacycashTokensService.loadBalances();
    });
    this.ephemeralWalletTokensService.updateBalances$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ephemeralWalletTokensService.loadBalances();
      });
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }
}
