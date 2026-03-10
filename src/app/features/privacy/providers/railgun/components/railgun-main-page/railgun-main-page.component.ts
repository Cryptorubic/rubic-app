import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { StepType } from '@features/privacy/providers/railgun/models/step';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { PageType } from '@features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';
import { RAILGUN_PAGES } from '@features/privacy/providers/railgun/constants/railgun-pages';

@Component({
  selector: 'app-railgun-main-page',
  templateUrl: './railgun-main-page.component.html',
  styleUrls: ['./railgun-main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailgunMainPageComponent {
  private readonly _disabledPages$ = new BehaviorSubject(RAILGUN_PAGES.slice(1));

  public readonly disabledPages$ = this._disabledPages$.asObservable();

  private readonly _activePage$ = new BehaviorSubject<PageType>(RAILGUN_PAGES[0]);

  public readonly activePage$ = this._activePage$.asObservable();

  public readonly pages = RAILGUN_PAGES;

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly _currentStep$ = new BehaviorSubject<StepType>('connectWallet');

  public readonly currentStep$ = this._currentStep$.asObservable();

  public readonly account$ = this.railgunFacade.account$;

  public readonly railgunAccount$ = this.railgunFacade.railgunAccount$;

  public readonly balances$ = this.railgunFacade.balances$;

  public readonly pendingBalances$ = this.railgunFacade.pendingBalances$;

  constructor() {
    this.initializeRailgun();
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
    this._activePage$.next(RAILGUN_PAGES[1]);
  }

  public onStepChange(step: StepType): void {
    this._currentStep$.next(step);
  }

  public logout(): void {
    // this._account$.next(null);
    // this._railgunAccount$.next(null);
    // this._balances$.next([]);
    // this._currentStep$.next('connectWallet');
  }

  public onPageSelect(page: PageType): void {
    this._activePage$.next(page);
  }
}
