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
import { NAVIGATION_LIST } from '@core/header/components/header/components/rubic-menu/models/navigation-list';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { CommonModalService } from '@app/core/services/modal/common-modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';

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

  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<never>>;

  public isOpened = false;

  public readonly currentUser$ = this.authService.currentUser$;

  public currentBlockchainIcon: string;

  public readonly navigationList = NAVIGATION_LIST;

  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly headerStore: HeaderStore,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly commonModalService: CommonModalService,
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

  public closeMenu(): void {
    this.isOpened = false;
  }

  public menuClickHandler(): void {
    this.handleButtonClick();
    this.closeMenu();
    this.swapClick.emit();
  }

  public logout(): void {
    this.authService.disconnectWallet();
  }

  public handleButtonClick(item?: NavigationItem): void {
    this.gtmService.reloadGtmSession();
    if (item) {
      this.window.open(item.link, '_blank');
    }
  }

  public openRecentTradesModal(): void {
    this.commonModalService
      .openRecentTradesModal({
        size: this.headerStore.isMobile ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }
}
