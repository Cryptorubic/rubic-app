import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { HeaderStore } from '../../../../services/header.store';
import { UserInterface } from '../../../../../services/auth/models/user.interface';
import { AuthService } from '../../../../../services/auth/auth.service';
import { IBlockchain } from '../../../../../../shared/models/blockchain/IBlockchain';
import { ProviderConnectorService } from '../../../../../services/blockchain/provider-connector/provider-connector.service';
import { LogoutConfirmModalComponent } from '../logout-confirm-modal/logout-confirm-modal.component';

@Component({
  selector: 'app-rubic-menu',
  templateUrl: './rubic-menu.component.html',
  styleUrls: ['./rubic-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<never>>;

  public isOpened = false;

  public $currentUser: Observable<UserInterface>;

  public currentBlockchain: IBlockchain;

  private _onNetworkChanges$: Subscription;

  private _onAddressChanges$: Subscription;

  constructor(
    private router: Router,
    private headerStore: HeaderStore,
    private authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly providerConnectorService: ProviderConnectorService,
    private translateService: TranslateService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {
    this.$currentUser = this.authService.getCurrentUser();
  }

  public ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this._onNetworkChanges$ = this.providerConnectorService.$networkChange.subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.detectChanges();
    });
    this._onAddressChanges$ = this.providerConnectorService.$addressChange.subscribe(() =>
      this.cdr.detectChanges()
    );
  }

  public ngOnDestroy(): void {
    this._onNetworkChanges$.unsubscribe();
    this._onAddressChanges$.unsubscribe();
  }

  public getDropdownStatus(opened) {
    this.isOpened = opened;
  }

  public closeMenu() {
    this.isOpened = false;
  }

  public toggleConfirmModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(LogoutConfirmModalComponent, this.injector), {
        size: 's',
        label: this.translateService.instant('navigation.logoutMessage')
      })
      .subscribe();
  }

  isLinkActive(url) {
    return window.location.pathname === url;
  }
}
