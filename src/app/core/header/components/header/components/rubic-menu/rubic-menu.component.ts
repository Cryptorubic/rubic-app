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
import { TuiDialogService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { NavigationItem } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-item';
import { NAVIGATION_LIST } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-list';
import { HeaderStore } from '../../../../services/header.store';

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

  public readonly navigationList: NavigationItem[];

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
    this.navigationList = NAVIGATION_LIST;
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

  public logout(): void {
    this.authService.signOut().subscribe();
  }

  isLinkActive(url) {
    return window.location.pathname === url;
  }
}
