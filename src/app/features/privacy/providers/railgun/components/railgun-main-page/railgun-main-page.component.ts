import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { StepType } from '@features/privacy/providers/railgun/models/step';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { PageType } from '@features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';
import { RAILGUN_PAGES } from '@features/privacy/providers/railgun/constants/railgun-pages';
import { combineLatestWith } from 'rxjs/operators';
import { fadeAnimation } from '@shared/utils/utils';
import { PrivatePageTypeService } from '@features/privacy/providers/shared-privacy-providers/services/private-page-type/private-page-type.service';

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

  public readonly utxoScan$ = this.railgunFacade.utxoScan$;

  private readonly _disabledPages$ = new BehaviorSubject(RAILGUN_PAGES.slice(1));

  public readonly disabledPages$ = this._disabledPages$.asObservable().pipe(
    combineLatestWith(this.utxoScan$),
    map(([disabledPages, utxoScan]) => {
      if (utxoScan === 100 || utxoScan === 0) {
        return disabledPages;
      }
      return [
        ...new Set([
          ...disabledPages,
          RAILGUN_PAGES[2],
          RAILGUN_PAGES[3],
          RAILGUN_PAGES[4],
          RAILGUN_PAGES[5]
        ])
      ];
    })
  );

  public readonly activePage$ = this.privacyService.activePage$;

  public readonly pages = RAILGUN_PAGES;

  private readonly _currentStep$ = new BehaviorSubject<StepType>('connectWallet');

  public readonly currentStep$ = this._currentStep$.asObservable();

  public readonly account$ = this.railgunFacade.account$;

  public readonly railgunAccount$ = this.railgunFacade.railgunAccount$;

  public readonly balances$ = this.railgunFacade.balances$;

  public readonly pendingBalances$ = this.railgunFacade.pendingBalances$;

  constructor() {
    this.initializeRailgun();
    this.privacyService.activePage = RAILGUN_PAGES[0];
  }

  ngOnInit() {
    this.railgunAccount$.subscribe(el => {
      if (el?.id) {
        this.handleLogin();
      }
    });
  }

  private async initializeRailgun(): Promise<void> {
    this.railgunFacade.initService();
  }

  public onSubmit(account: PublicAccount): void {
    this.railgunFacade.setAccount(account);
    this.handleLogin();
  }

  private handleLogin(): void {
    this._disabledPages$.next([RAILGUN_PAGES[0], RAILGUN_PAGES[4]]);
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
}
