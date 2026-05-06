import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { HINKAL_PAGES } from '../../constants/hinkal-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { combineLatestWith, distinctUntilChanged, filter, first, map } from 'rxjs';
import { HinkalInstanceService } from '../../services/hinkal-sdk/hinkal-instance.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HinkalActionButtonService } from '../../services/hinkal-action-button.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { List } from 'immutable';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { ActivatedRoute } from '@angular/router';
import { HinkalHideFacadeService } from '../../services/token-facades/hinkal-hide-facade.service';

@Component({
  selector: 'app-hinkal-view',
  templateUrl: './hinkal-view.component.html',
  styleUrls: ['./hinkal-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: PrivateActionButtonService,
      useClass: HinkalActionButtonService
    }
  ],
  standalone: false
})
export class HinkalViewComponent {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly activeChain$ = this.hinkalFacadeService.activeChain$;

  public readonly supportedChains = HINKAL_SUPPORTED_CHAINS;

  public readonly pages = HINKAL_PAGES;

  public readonly disabledPages$ = this.hinkalInstanceService.currSignature$.pipe(
    combineLatestWith(
      this.privateLocalStorageService.alreadyMadeShielding$(PRIVATE_TRADE_TYPE.HINKAL)
    ),
    map(([signature, alreadyMadeShielding]) => {
      if (!signature) {
        return this.pages.filter(page => page.type !== 'login');
      }
      if (!alreadyMadeShielding) {
        return this.pages.filter(page => page.type !== 'hide' && page.type !== 'walletInfo');
      }
      return this.pages.filter(page => page.type === 'login');
    })
  );

  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly hinkalHideFacade: HinkalHideFacadeService,
    private readonly privateQueryParamsService: PrivateQueryParamsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privateLocalStorageService: PrivateLocalStorageService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.privatePageTypeService.activePage =
      this.pages.find(page => page.type === 'login') || this.pages[0];
  }

  ngOnInit(): void {
    this.hinkalFacadeService.initSubs();
    this.parseQueryParams();
    this.walletConnectorService.addressChange$
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.hinkalFacadeService.logout();
        this.privatePageTypeService.activePage = this.pages.find(page => page.type === 'login');
      });

    this.activatedRoute.queryParams
      .pipe(
        filter(params => params.fromChain),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => {
        this.hinkalFacadeService.switchChain(params.fromChain);
      });
  }

  ngOnDestroy() {
    this.hinkalFacadeService.resetState();
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }

  private parseQueryParams(): void {
    this.hinkalHideFacade
      .getTokensList('allChains', '', 'from', getEmptySwapFormInput())
      .pipe(
        filter(tokens => tokens.length > 0),
        first()
      )
      .subscribe(supportedTokens => {
        this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(List(supportedTokens));
      });
  }

  readonly destroyRef = inject(DestroyRef);
}
