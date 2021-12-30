import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  TemplateRef,
  Inject,
  Injector
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDialogService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { WINDOW } from '@ng-web-apis/common';
import { HeaderStore } from '../../../../services/header.store';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements AfterViewInit, OnDestroy {
  constructor(
    private readonly headerStore: HeaderStore,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private translateService: TranslateService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.isMobile$ = this.headerStore.getMobileDisplayStatus();
    this.isConfirmModalOpened$ = this.headerStore.getConfirmModalOpeningStatus();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.headerStore.setMobileMenuOpeningStatus(false);
        this.headerStore.setConfirmModalOpeningStatus(false);
      }
    });
    this.currentUser$ = this.authService.getCurrentUser();
  }

  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<unknown>>;

  private clicks = 0;

  public readonly isConfirmModalOpened$: Observable<boolean>;

  public readonly isMobile$: Observable<boolean>;

  public readonly currentUser$: Observable<UserInterface>;

  public currentBlockchain: BlockchainData;

  public dropdownIsOpened = false;

  private _onNetworkChanges$: Subscription;

  private _onAddressChanges$: Subscription;

  public drowdownItems = [{ title: 'My trades' }, { title: 'Log out' }];

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this._onNetworkChanges$ = this.walletConnectorService.networkChange$.subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.detectChanges();
    });
    this._onAddressChanges$ = this.walletConnectorService.addressChange$.subscribe(() =>
      this.cdr.detectChanges()
    );
  }

  ngOnDestroy(): void {
    this._onNetworkChanges$.unsubscribe();
    this._onAddressChanges$.unsubscribe();
  }

  public useTestingMode(): void {
    this.clicks++;
    const neededClicksAmount = 5;
    if (this.clicks >= neededClicksAmount) {
      this.clicks = 0;
      this.window.testingMode.use();
    }
  }

  public logout(): void {
    this.authService.signOut().subscribe();
  }

  public getDropdownStatus(status: boolean): void {
    this.dropdownIsOpened = status;
  }
}
