import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Self, inject } from '@angular/core';
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
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivacycashActionButtonService } from '../../services/common/action-button/privacycash-action-button.service';
import { HideWindowService } from '../../../shared-privacy-providers/services/hide-window-service/hide-window.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { PrivateSwapInfo } from '../../../shared-privacy-providers/models/swap-info';
import { PrivacycashPrivateTokensFacadeService } from '../../services/common/token-facades/privacycash-private-tokens-facade.service';
import { PrivacycashPublicTokensFacadeService } from '../../services/common/token-facades/privacycash-public-tokens-facade.service';
import { RevealWindowService } from '../../../shared-privacy-providers/services/reveal-window/reveal-window.service';
import { PrivateTransferWindowService } from '../../../shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import { PrivateSwapWindowService } from '../../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { PrivateRefundWindowService } from '../../../shared-privacy-providers/services/private-refund-window/private-refund-window.service';
import {
  getKey,
  getMinimalTokensByChain
} from '../../services/common/token-facades/utils/get-minimal-tokens-by-chain';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';

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

  private readonly hideTokensWindowService = inject(HideWindowService);

  private readonly revealTokensWindowService = inject(RevealWindowService);

  private readonly privateTransferWindowService = inject(PrivateTransferWindowService);

  private readonly privateRefundWindowService = inject(PrivateRefundWindowService);

  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  private readonly privateQueryParamsService = inject(PrivateQueryParamsService);

  private readonly privateTokensFacade = inject(PrivacycashPrivateTokensFacadeService);

  private readonly publicTokensFacade = inject(PrivacycashPublicTokensFacadeService);

  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = PRIVACYCASH_PAGES;

  public readonly disabledPages$: Observable<PageType[]> =
    this.privacycashSignatureService.signature$.pipe(
      map(signature => {
        if (!isNil(signature) && signature.length) {
          return this.pages.filter(page => page.type === 'login');
        }
        return this.pages.filter(page => page.type !== 'login');
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
    this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(
      this.publicTokensFacade.tokens,
      (swapInfo: PrivateSwapInfo) => {
        this.hideTokensWindowService.setHideAsset(swapInfo.fromAsset);
        this.hideTokensWindowService.setHideAmount(swapInfo.fromAmount);
      }
    );

    const pcSupportedMap = getMinimalTokensByChain('allChains').reduce(
      (acc, token) => ({ ...acc, [getKey(token)]: token }),
      {} as Record<string, MinimalToken>
    );
    const pcPrivateTokens = this.privateTokensFacade.tokens.filter(
      t => !!pcSupportedMap[getKey(t)]
    );
    console.log('pcPrivateTokens ==>', pcPrivateTokens);
    this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(
      pcPrivateTokens,
      (swapInfo: PrivateSwapInfo) => {
        this.revealTokensWindowService.setRevealAsset(swapInfo.fromAsset);
        this.revealTokensWindowService.setRevealAmount(swapInfo.fromAmount);

        this.privateTransferWindowService.setTransferAsset(swapInfo.fromAsset);
        this.privateTransferWindowService.setTransferAmount(swapInfo.fromAmount);

        this.privateRefundWindowService.setTransferAsset(swapInfo.fromAsset);
        this.privateRefundWindowService.setTransferAmount(swapInfo.fromAmount);

        this.privateSwapWindowService.patchSwapInfo(swapInfo);
      }
    );
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }
}
