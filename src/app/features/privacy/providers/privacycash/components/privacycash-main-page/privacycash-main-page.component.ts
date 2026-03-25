import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Self, inject } from '@angular/core';
import { Observable, combineLatestWith, filter, first, map, takeUntil } from 'rxjs';
import { PRIVACYCASH_PAGES } from '../../constants/privacycash-steps';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { EphemeralWalletTokensService } from '../../services/common/token-facades/ephemeral-wallet-tokens.service';
import { PrivacycashSignatureService } from '../../services/privacy-cash-signature.service';
import { isNil } from '@app/shared/utils/utils';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivacycashActionButtonService } from '../../services/common/action-button/privacycash-action-button.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { PrivacycashPublicTokensFacadeService } from '../../services/common/token-facades/privacycash-public-tokens-facade.service';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { List } from 'immutable';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';

@Component({
  selector: 'app-privacy-cash-view',
  templateUrl: './privacycash-main-page.component.html',
  styleUrls: ['./privacycash-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: PrivateActionButtonService, useClass: PrivacycashActionButtonService }
  ]
})
export class PrivacycashMainPageComponent implements OnInit, OnDestroy {
  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly ephemeralWalletTokensService = inject(EphemeralWalletTokensService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  private readonly privateQueryParamsService = inject(PrivateQueryParamsService);

  private readonly privacycashPublicTokensFacade = inject(PrivacycashPublicTokensFacadeService);

  private readonly privateLocalStorageService = inject(PrivateLocalStorageService);

  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = PRIVACYCASH_PAGES;

  public readonly disabledPages$: Observable<PageType[]> =
    this.privacycashSignatureService.signature$.pipe(
      combineLatestWith(
        this.privateLocalStorageService.alreadyMadeShielding$(PRIVATE_TRADE_TYPE.PRIVACY_CASH)
      ),
      map(([signature, alreadyMadeShielding]) => {
        if (isNil(signature) || !signature.length) {
          return this.pages.filter(page => page.type !== 'login');
        }
        if (!alreadyMadeShielding) {
          return this.pages.filter(page => page.type !== 'hide');
        }
        return this.pages.filter(page => page.type === 'login');
      })
    );

  public readonly privateBalanceLoading$ = this.privacycashTokensService.loading$;

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privatePageTypeService: PrivatePageTypeService
  ) {
    this.privatePageTypeService.activePage =
      this.pages.find(page => page.type === 'login') || this.pages[0];
  }

  ngOnDestroy(): void {
    this.privacycashTokensService.abortController.abort();
  }

  ngOnInit(): void {
    this.parseQueryParams();

    this.walletConnectorService.addressChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userAddr => {
        if (userAddr) {
          this.privacycashTokensService.resetAbortController();
        } else {
          this.privacycashTokensService.abortController.abort();
          this.privacycashSignatureService.removeSignature();
        }
      });

    this.privacycashSignatureService.signature$
      .pipe(takeUntil(this.destroy$))
      .subscribe(signature => {
        if (!!signature && signature.length) {
          this.privacycashTokensService.updatePrivateBalances();
          this.privatePageTypeService.activePage =
            this.pages.find(page => page.type === 'hide') || this.pages[0];
        } else {
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

  private parseQueryParams(): void {
    this.privacycashPublicTokensFacade
      .getTokensList('allChains', '', 'from', getEmptySwapFormInput())
      .pipe(
        filter(tokens => tokens.length > 0),
        first()
      )
      .subscribe(supportedTokens => {
        this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(List(supportedTokens));
      });
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }
}
