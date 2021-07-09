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
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HeaderStore } from '../../../../services/header.store';
import { LogoutConfirmModalComponent } from '../logout-confirm-modal/logout-confirm-modal.component';

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
    private readonly providerConnectorService: ProviderConnectorService,
    private translateService: TranslateService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.$isConfirmModalOpened = this.headerStore.getConfirmModalOpeningStatus();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.headerStore.setMobileMenuOpeningStatus(false);
        this.headerStore.setConfirmModalOpeningStatus(false);
      }
    });
    this.$currentUser = this.authService.getCurrentUser();
  }

  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  private clicks = 0;

  public readonly $isConfirmModalOpened: Observable<boolean>;

  public readonly $isMobile: Observable<boolean>;

  public readonly $currentUser: Observable<UserInterface>;

  public currentBlockchain: IBlockchain;

  public dropdownIsOpened = false;

  private _onNetworkChanges$: Subscription;

  private _onAddressChanges$: Subscription;

  public drowdownItems = [{ title: 'My trades' }, { title: 'Log out' }];

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this._onNetworkChanges$ = this.providerConnectorService.$networkChange.subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.detectChanges();
    });
    this._onAddressChanges$ = this.providerConnectorService.$addressChange.subscribe(() =>
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
      (window as any).useTestingMode();
    }
  }

  public toggleConfirmModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(LogoutConfirmModalComponent, this.injector), {
        size: 's',
        label: this.translateService.instant('navigation.logoutMessage')
      })
      .subscribe();
  }

  public getDropdownStatus(status) {
    this.dropdownIsOpened = status;
  }
}
