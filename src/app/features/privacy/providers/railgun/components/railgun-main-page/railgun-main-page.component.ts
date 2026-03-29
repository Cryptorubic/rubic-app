import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { StepType } from '@features/privacy/providers/railgun/models/step';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { PageType } from '@features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';
import { RAILGUN_PAGES } from '@features/privacy/providers/railgun/constants/railgun-pages';
import { combineLatestWith, filter, first } from 'rxjs/operators';
import { fadeAnimation } from '@shared/utils/utils';
import { PrivatePageTypeService } from '@features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';
import { TokenService } from '@core/services/sdk/sdk-legacy/token-service/token.service';
import { PrivateQueryParamsService } from '../../../shared-privacy-providers/services/query-params/private-query-params.service';
import { RailgunRevealFacadeService } from '../../services/common/railgun-reveal-facade.service';
import { List } from 'immutable';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { HeaderStore } from '@core/header/services/header.store';
import { distinctObjectUntilChanged } from '@shared/utils/distinct-object-until-changed';
import { fromRubicToPrivateChainMap } from '@features/privacy/providers/railgun/constants/network-map';
import { PAGE_TYPE_IMAGE } from '@features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type-image';

@Component({
  selector: 'app-railgun-main-page',
  templateUrl: './railgun-main-page.component.html',
  styleUrls: ['./railgun-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation]
})
export class RailgunMainPageComponent {
  private readonly privacyService = inject(PrivatePageTypeService);

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly privateLocalStorageService = inject(PrivateLocalStorageService);

  public readonly utxoScan$ = this.railgunFacade.utxoScan$;

  private readonly _disabledPages$ = new BehaviorSubject(RAILGUN_PAGES.slice(1));

  public readonly disabledPages$ = this._disabledPages$.asObservable().pipe(
    combineLatestWith(this.railgunFacade.allowPrivateAction$),
    map(([disabledPages, allowPrivateAction]) => {
      if (allowPrivateAction) {
        return disabledPages;
      }
      return [...new Set([...disabledPages, RAILGUN_PAGES[3], RAILGUN_PAGES[4]])];
    })
  );

  public readonly activePage$ = this.privacyService.activePage$;

  public readonly pages = RAILGUN_PAGES;

  private readonly _currentStep$ = new BehaviorSubject<StepType>('connectWallet');

  public readonly currentStep$ = this._currentStep$.asObservable();

  public readonly account$ = this.railgunFacade.account$;

  public readonly railgunAccount$ = this.railgunFacade.railgunAccount$;

  public readonly balances$ = this.railgunFacade.balances$;

  private readonly tokensService = inject(TokenService);

  private readonly privateQueryParamsService = inject(PrivateQueryParamsService);

  private readonly revealTokensFacade = inject(RailgunRevealFacadeService);

  public readonly pendingBalances$ = this.railgunFacade.shieldedTokens$;

  public railgunEngineLoading$ = this.railgunFacade.railgunInitialised$.pipe(map(el => !el));

  public showBalanceLoading$ = this.utxoScan$.pipe(
    map(scan => Object.values(scan).some(el => el < 100))
  );

  private readonly notificationService = inject(NotificationsService);

  private readonly headerStore = inject(HeaderStore);

  public readonly poiLoading$ = this.railgunFacade.missingPOI$.pipe(
    map(el => {
      console.log('POI LOADING', el);
      return el.some(chain => chain.missingPOI);
    })
  );

  public readonly isMobile = this.headerStore.isMobile;

  constructor() {
    this.initializeRailgun();
    this.privacyService.activePage = RAILGUN_PAGES[0];
    this.railgunFacade.missingPOI$.pipe(
      distinctObjectUntilChanged(),
      filter(chains => chains.some(Boolean)),
      switchMap(chains => {
        return Promise.allSettled(
          chains.map(value =>
            this.railgunFacade.generatePOI(fromRubicToPrivateChainMap[value.chain])
          )
        );
      })
    );
  }

  ngOnInit() {
    this.parseQueryParams();
    this.railgunAccount$.subscribe(el => {
      if (el?.id) {
        this.handleLogin();
      }
    });
  }

  private async initializeRailgun(): Promise<void> {
    this.railgunFacade.initWorker();
  }

  public onSubmit(account: PublicAccount): void {
    this.railgunFacade.setAccount(account);
    this.handleLogin();
  }

  private handleLogin(): void {
    this._disabledPages$.next([RAILGUN_PAGES[0]]);
    this.privacyService.activePage = RAILGUN_PAGES[1];
  }

  public onStepChange(step: StepType): void {
    this._currentStep$.next(step);
  }

  public logout(): void {
    this.railgunFacade.logout();
    this.privacyService.activePage = RAILGUN_PAGES[0];
    this._disabledPages$.next(RAILGUN_PAGES.slice(1));
  }

  public onPageSelect(page: PageType): void {
    this.privacyService.activePage = page;
  }

  private parseQueryParams(): void {
    this.revealTokensFacade
      .getTokensList('allChains', '', 'from', getEmptySwapFormInput())
      .pipe(
        filter(tokens => tokens.length > 0),
        first()
      )
      .subscribe(supportedTokens => {
        this.privateQueryParamsService.parseMainSwapInfoAndQueryParams(List(supportedTokens));
      });
  }

  protected readonly PAGE_TYPE_IMAGE = PAGE_TYPE_IMAGE;
}
