import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { HINKAL_PAGES } from '../../constants/hinkal-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { combineLatestWith, distinctUntilChanged, filter, first, map, takeUntil } from 'rxjs';
import { HinkalInstanceService } from '../../services/hinkal-sdk/hinkal-instance.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HinkalActionButtonService } from '../../services/hinkal-action-button.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { List } from 'immutable';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BlockchainName } from '@cryptorubic/core';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { HinkalSwapTokensFacadeService } from '../../services/hinkal-swap-tokens-facade.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hinkal-view',
  templateUrl: './hinkal-view.component.html',
  styleUrls: ['./hinkal-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    {
      provide: PrivateActionButtonService,
      useClass: HinkalActionButtonService
    }
  ]
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
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly hinkalRevealFacade: HinkalSwapTokensFacadeService,
    private readonly privateQueryParamsService: PrivateQueryParamsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly privateLocalStorageService: PrivateLocalStorageService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.privatePageTypeService.activePage =
      this.pages.find(page => page.type === 'login') || this.pages[0];
  }

  ngOnInit(): void {
    this.parseQueryParams();
    this.walletConnectorService.addressChange$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.hinkalFacadeService.logout();
        this.privatePageTypeService.activePage = this.pages.find(page => page.type === 'login');
      });

    this.activatedRoute.queryParams
      .pipe(
        filter(params => params.fromChain),
        takeUntil(this.destroy$)
      )
      .subscribe(params => {
        this.hinkalFacadeService.switchChain(params.fromChain);
      });
  }

  ngOnDestroy() {
    this.hinkalFacadeService.removeSubs();
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }

  public onSwitchNetwork(chain: BlockchainName): void {
    this.hinkalFacadeService.switchChain(chain);
  }

  private parseQueryParams(): void {
    this.hinkalRevealFacade
      .getTokensList('allChains', '', 'from', getEmptySwapFormInput())
      .pipe(
        filter(tokens => tokens.length > 0),
        first()
      )
      .subscribe(supportedTokens => {
        this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(List(supportedTokens));
      });
  }
}
