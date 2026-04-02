import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { ZAMA_PAGES } from '../../constants/zama-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { combineLatestWith, distinctUntilChanged, filter, first, map, takeUntil } from 'rxjs';
import { ZamaSignatureService } from '../../services/zama-sdk/zama-signature.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { ZamaActionButtonService } from '../../services/zama-action-button.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { List } from 'immutable';
import { ZamaHideTokensFacadeService } from '../../services/zama-hide-tokens-facade.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';

@Component({
  selector: 'app-zama-view',
  templateUrl: './zama-view.component.html',
  styleUrls: ['./zama-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    {
      provide: PrivateActionButtonService,
      useClass: ZamaActionButtonService
    }
  ]
})
export class ZamaViewComponent {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = ZAMA_PAGES;

  public readonly disabledPages$ = this.zamaSignatureService.signatureInfo$.pipe(
    combineLatestWith(
      this.privateLocalStorageService.alreadyMadeShielding$(PRIVATE_TRADE_TYPE.ZAMA)
    ),
    map(([signature, alreadyMadeShielding]) => {
      if (!signature) {
        return this.pages.filter(page => page.type !== 'login');
      }
      if (!alreadyMadeShielding) {
        return this.pages.filter(page => page.type !== 'hide');
      }
      return this.pages.filter(page => page.type === 'login');
    })
  );

  constructor(
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly authService: AuthService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly zamaSignatureService: ZamaSignatureService,
    private readonly zamaHideTokensFacade: ZamaHideTokensFacadeService,
    private readonly privateQueryParamsService: PrivateQueryParamsService,
    private readonly privateLocalStorageService: PrivateLocalStorageService
  ) {
    this.privatePageTypeService.activePage = this.pages.find(page => page.type === 'hide');
    this.initZama();
  }

  ngOnInit(): void {
    this.parseQueryParams();
    this.authService.currentUser$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(user => {
        if (user?.address) {
          const isUpdated = this.zamaSignatureService.updateSignatureFromStore(user?.address);
          if (isUpdated) {
            this.privatePageTypeService.activePage = this.pages.find(page => page.type === 'hide');
            return;
          }
        }

        this.zamaSignatureService.resetSignature();
        this.privatePageTypeService.activePage = this.pages.find(page => page.type === 'login');
      });
  }

  ngOnDestroy(): void {
    this.zamaFacadeService.removeSubs();
  }

  private async initZama(): Promise<void> {
    await this.zamaFacadeService.initServices();
  }

  public onPageSelect(page: PageType): void {
    this.privatePageTypeService.activePage = page;
  }

  private parseQueryParams(): void {
    this.zamaHideTokensFacade
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
