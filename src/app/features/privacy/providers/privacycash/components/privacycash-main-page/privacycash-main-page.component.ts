import { ChangeDetectionStrategy, Component, OnInit, Self, inject } from '@angular/core';
import { Observable, combineLatestWith, filter, map, takeUntil } from 'rxjs';
import { PRIVACYCASH_PAGES } from '../../constants/privacycash-steps';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { EphemeralWalletTokensService } from '../../services/common/token-facades/ephemeral-wallet-tokens.service';
import { PrivacycashSignatureService } from '../../services/privacy-cash-signature.service';
import { isNil } from '@app/shared/utils/utils';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';

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

  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = PRIVACYCASH_PAGES;

  public readonly disabledPages$: Observable<PageType[]> =
    this.privacycashSignatureService.signature$.pipe(
      map(signature => {
        if (!isNil(signature) && signature.length) return [];
        return this.pages.filter(page => page.type !== 'login');
      })
    );

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly tokensFacade: TokensFacadeService
  ) {
    this.privatePageTypeService.activePage =
      this.pages.find(page => page.type === 'login') || this.pages[0];
  }

  ngOnInit(): void {
    this.walletConnectorService.addressChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userAddr => {
        if (userAddr) {
          this.privacycashTokensService.updatePrivateBalances();
        } else {
          this.privacycashSignatureService.removeSignature();
          this.privatePageTypeService.activePage =
            this.pages.find(page => page.type === 'login') || this.pages[0];
        }
      });
    this.privacycashTokensService.updateBalances$
      .pipe(
        combineLatestWith(this.privacycashSignatureService.signature$),
        filter(([_, signature]) => !!signature && signature.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.privacycashTokensService.loadBalances();
      });
    this.ephemeralWalletTokensService.updateBalances$
      .pipe(
        combineLatestWith(this.privacycashSignatureService.signature$),
        filter(([_, signature]) => !!signature && signature.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.ephemeralWalletTokensService.loadBalances();
      });
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }
}
