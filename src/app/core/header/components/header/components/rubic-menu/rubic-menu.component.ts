import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { NavigationItem } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-item';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { WINDOW } from '@ng-web-apis/common';
import { NAVIGATION_LIST } from '@core/header/components/header/components/rubic-menu/models/navigation-list';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

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

  public currentBlockchain: BlockchainData;

  private _onNetworkChanges$: Subscription;

  private _onAddressChanges$: Subscription;

  public readonly navigationList: NavigationItem[];

  constructor(
    private authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly gtmService: GoogleTagManagerService,
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
    this._onNetworkChanges$ = this.walletConnectorService.networkChange$.subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.detectChanges();
    });
    this._onAddressChanges$ = this.walletConnectorService.addressChange$.subscribe(() =>
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
  public menuClickHandler(
    linkType: 'swaps' | 'bridge' | 'cross-chain' | 'staking' | 'promotion' | 'liquidityProviding'
  ): void {
    this.handleButtonClick();
    this.closeMenu();
    switch (linkType) {
      case 'swaps':
        this.swapClick.emit();
      case 'cross-chain':
        this.crossChainClick.emit();
    }
  }

  public logout(): void {
    this.authService.serverlessSignOut();
  }

  isLinkActive(url: string): boolean {
    return this.window.location.pathname === url;
  }

  public handleButtonClick(): void {
    this.gtmService.reloadGtmSession();
  }
}
