import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CLEARSWAP_PAGES } from '@app/features/privacy/providers/clearswap/constants/clearswap-pages';
import { ClearswapPrivateActionButtonService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-action-button.service';
import { PageType } from '@app/features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { ClearswapTokensFacadeService } from '../../services/clearswap-tokens-facade.service';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { filter, first } from 'rxjs';
import { List } from 'immutable';
import { ClearswapPrivateAssetsService } from '../../services/clearswap-private-assets.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ClearswapBalancesService } from '../../services/clearswap-balances.service';

@Component({
  selector: 'app-clearswap-view',
  templateUrl: './clearswap-view.component.html',
  styleUrls: ['./clearswap-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: FromAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: ToAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService },
    { provide: PrivateActionButtonService, useClass: ClearswapPrivateActionButtonService }
  ]
})
export class ClearswapViewComponent implements OnInit {
  private readonly privateQueryParamsService = inject(PrivateQueryParamsService);

  private readonly clearswapTokensFacade = inject(ClearswapTokensFacadeService);

  private readonly сlearswapBalancesService = inject(ClearswapBalancesService);

  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = CLEARSWAP_PAGES;

  constructor(private readonly privatePageTypeService: PrivatePageTypeService) {
    this.privatePageTypeService.activePage = this.pages[0];
  }

  ngOnInit(): void {
    this.parseQueryParams();

    this.сlearswapBalancesService.subscribeOnWallet();
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }

  private parseQueryParams(): void {
    this.clearswapTokensFacade
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
