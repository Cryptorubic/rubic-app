import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { Observable, combineLatestWith, filter, first, map } from 'rxjs';
import { PRIVACYCASH_PAGES } from '../../constants/privacycash-steps';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivacycashTokensService } from '../../services/common/token-facades/privacycash-tokens.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
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
  providers: [{ provide: PrivateActionButtonService, useClass: PrivacycashActionButtonService }]
})
export class PrivacycashMainPageComponent implements OnInit, OnDestroy {
  private readonly privacycashTokensService = inject(PrivacycashTokensService);

  private readonly ephemeralWalletTokensService = inject(EphemeralWalletTokensService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly privacycashSignatureService = inject(PrivacycashSignatureService);

  private readonly privateQueryParamsService = inject(PrivateQueryParamsService);

  private readonly privacycashPublicTokensFacade = inject(PrivacycashPublicTokensFacadeService);

  private readonly privateLocalStorageService = inject(PrivateLocalStorageService);

  private readonly destroyRef = inject(DestroyRef);

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

  constructor(private readonly privatePageTypeService: PrivatePageTypeService) {
    this.privatePageTypeService.activePage =
      this.pages.find(page => page.type === 'login') || this.pages[0];
  }

  ngOnDestroy(): void {
    this.privacycashTokensService.stopWorker();
  }

  ngOnInit(): void {
    this.parseQueryParams();

    this.privacycashTokensService
      .workerOutMsg$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.walletConnectorService.addressChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(userAddr => {
        if (!userAddr) {
          this.privacycashSignatureService.removeSignature();
          this.privacycashTokensService.stopWorker();
        }
      });

    this.privacycashSignatureService.signature$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(signature => {
        if (!!signature && signature.length) {
          this.privacycashTokensService.initWorker();
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.privacycashTokensService.loadBalances();
      });

    this.ephemeralWalletTokensService.updateBalances$
      .pipe(
        combineLatestWith(this.privacycashSignatureService.signature$),
        filter(([_, signature]) => !!signature && signature.length > 0),
        takeUntilDestroyed(this.destroyRef)
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
