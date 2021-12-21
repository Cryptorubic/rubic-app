import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  Output,
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
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { NavigationItem } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-item';
import { NAVIGATION_LIST } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-list';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { WINDOW } from '@ng-web-apis/common';
import { HeaderStore } from '../../../../services/header.store';

@Component({
  selector: 'app-rubic-menu',
  templateUrl: './rubic-menu.component.html',
  styleUrls: ['./rubic-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicMenuComponent implements AfterViewInit, OnDestroy {
  @Input() public swapActive: boolean;

  @Input() public bridgeActive: boolean;

  @Input() public crossChainActive: boolean;

  @Output() public readonly swapClick: EventEmitter<void>;

  @Output() public readonly bridgeClick: EventEmitter<void>;

  @Output() public readonly crossChainClick: EventEmitter<void>;

  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<never>>;

  public isOpened = false;

  public currentUser$: Observable<UserInterface>;

  public countUnread$: Observable<number>;

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
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly swapFormService: SwapFormService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector,
    @Inject(WINDOW) private window: Window
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.countUnread$ = this.counterNotificationsService.unread$;
    this.navigationList = NAVIGATION_LIST;
    this.bridgeClick = new EventEmitter<void>();
    this.swapClick = new EventEmitter<void>();
    this.crossChainClick = new EventEmitter<void>();
  }

  public ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this._onNetworkChanges$ = this.providerConnectorService.networkChange$.subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.detectChanges();
    });
    this._onAddressChanges$ = this.providerConnectorService.addressChange$.subscribe(() =>
      this.cdr.detectChanges()
    );
  }

  public ngOnDestroy(): void {
    this._onNetworkChanges$.unsubscribe();
    this._onAddressChanges$.unsubscribe();
  }

  public getDropdownStatus(opened: boolean): void {
    this.isOpened = opened;
  }

  public closeMenu(): void {
    this.isOpened = false;
  }

  // TODO refactor: define type for links
  public menuClickHandler(linkType: 'swaps' | 'bridge' | 'cross-chain' | 'staking'): void {
    this.closeMenu();
    switch (linkType) {
      case 'swaps':
        this.swapClick.emit();
      case 'bridge':
        this.bridgeClick.emit();
      case 'cross-chain':
        this.crossChainClick.emit();
    }
  }

  public logout(): void {
    this.authService.signOut().subscribe();
  }

  isLinkActive(url: string): boolean {
    return this.window.location.pathname === url;
  }
}
