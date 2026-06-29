import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ZAMA_PAGES } from '../../constants/zama-pages';
import { PageType } from '../../../shared-privacy-providers/components/page-navigation/models/page-type';
import { ZamaFacadeService } from '../../services/zama-sdk/zama-facade.service';
import { PrivatePageTypeService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { combineLatestWith, distinctUntilChanged, filter, first, map } from 'rxjs';
import { ZamaSignatureService } from '../../services/zama-sdk/zama-signature.service';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { ZamaActionButtonService } from '../../services/zama-action-button.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { List } from 'immutable';
import { ZamaHideTokensFacadeService } from '../../services/zama-hide-tokens-facade.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  standalone: false,
  selector: 'app-zama-view',
  templateUrl: './zama-view.component.html',
  styleUrls: ['./zama-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: PrivateActionButtonService,
      useClass: ZamaActionButtonService
    }
  ]
})
export class ZamaViewComponent implements OnInit, OnDestroy {
  public readonly activePage$ = this.privatePageTypeService.activePage$;

  public readonly pages = ZAMA_PAGES;

  public readonly disabledPages$ = this.zamaSignatureService.signatureInfo$.pipe(
    combineLatestWith(
      this.privateLocalStorageService.alreadyMadeShielding$(PRIVATE_TRADE_TYPE.ZAMA)
    ),
    map(([signature, alreadyMadeShielding]) => {
      if (!signature || !alreadyMadeShielding) {
        return this.pages.filter(page => page.type !== 'hide');
      }
    })
  );

  constructor(
    private readonly zamaFacadeService: ZamaFacadeService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly zamaSignatureService: ZamaSignatureService,
    private readonly zamaHideTokensFacade: ZamaHideTokensFacadeService,
    private readonly privateQueryParamsService: PrivateQueryParamsService,
    private readonly privateLocalStorageService: PrivateLocalStorageService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.privatePageTypeService.activePage = this.pages[0];
    this.initZama();
  }

  ngOnInit(): void {
    this.parseQueryParams();
    this.walletConnectorService.activeWallets$
      .pipe(
        distinctUntilChanged(),
        map(() => this.walletConnectorService.getActiveProvider({ chainType: 'EVM' })),
        takeUntilDestroyed()
      )
      .subscribe(evmWalletAdapter => {
        if (evmWalletAdapter) {
          const isUpdated = this.zamaSignatureService.updateSignatureFromStore(
            evmWalletAdapter.address
          );
          if (isUpdated) return;
        }

        this.zamaSignatureService.resetSignature();
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
