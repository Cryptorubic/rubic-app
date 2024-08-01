import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  QueryList,
  Self,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { WalletConnectorService } from 'src/app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { NavigationItem } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-item';
import { WINDOW } from '@ng-web-apis/common';
import {
  MOBILE_NAVIGATION_LIST,
  NAVIGATION_LIST
} from '@core/header/components/header/components/rubic-menu/constants/navigation-list';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { KeyValue } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rubic-menu',
  templateUrl: './rubic-menu.component.html',
  styleUrls: ['./rubic-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RubicMenuComponent implements AfterViewInit {
  @Input() public swapActive: boolean;

  @Input() public crossChainActive: boolean;

  @Output() public readonly swapClick = new EventEmitter<void>();

  @Output() public readonly onClose = new EventEmitter<void>();

  public isOpened = false;

  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<never>>;

  public currentBlockchainIcon: string;

  public readonly navigationList = NAVIGATION_LIST;

  public readonly mobileNavigationList = MOBILE_NAVIGATION_LIST;

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly headerStore: HeaderStore,
    private readonly recentTradesStoreService: UnreadTradesService,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly router: Router,
    @Inject(WINDOW) private readonly window: Window,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngAfterViewInit(): void {
    this.walletConnectorService.networkChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(blockchainName => {
        this.currentBlockchainIcon = blockchainName ? blockchainIcon[blockchainName] : '';
        this.cdr.markForCheck();
      });
  }

  public menuClickHandler(): void {
    this.handleButtonClick();
    this.onClose.emit();
    this.swapClick.emit();
  }

  public logout(): void {
    this.authService.disconnectWallet();
  }

  public handleButtonClick(item?: NavigationItem): void {
    this.gtmService.reloadGtmSession();
    this.onClose.emit();
    if (!item) return;
    this.window.open(item.link, item?.target || '_blank');
  }

  public keepOriginalOrder = <K, V>(a: KeyValue<K, V>): number => Number(a.key);

  public mobileClose(): void {
    this.mobileNativeService.forceClose();
  }

  public closeMenu(): void {
    this.isOpened = false;
  }
}
