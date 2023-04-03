import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  TemplateRef,
  Self
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { WalletConnectorService } from 'src/app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HeaderStore } from '../../../../services/header.store';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { BlockchainName } from 'rubic-sdk';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/mobile-user-profile.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class UserProfileComponent implements AfterViewInit {
  constructor(
    private readonly headerStore: HeaderStore,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly modalService: ModalService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.isMobile$ = this.headerStore.getMobileDisplayStatus();
    this.isConfirmModalOpened$ = this.headerStore.getConfirmModalOpeningStatus();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.headerStore.setMobileMenuOpeningStatus(false);
        this.headerStore.setConfirmModalOpeningStatus(false);
      }
    });
    this.currentUser$ = this.authService.currentUser$;
  }

  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<unknown>>;

  public readonly isConfirmModalOpened$: Observable<boolean>;

  public readonly isMobile$: Observable<boolean>;

  public readonly currentUser$: Observable<UserInterface>;

  public currentBlockchainName: BlockchainName;

  public currentBlockchainIcon: string;

  public dropdownIsOpened = false;

  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  @ViewChildren('dropdownOptionTemplate') public dropdownItems: QueryList<TemplateRef<unknown>>;

  ngAfterViewInit(): void {
    this.walletConnectorService.networkChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(blockchainName => {
        this.currentBlockchainName = blockchainName;
        this.currentBlockchainIcon = blockchainName ? blockchainIcon[blockchainName] : '';
        this.cdr.detectChanges();
      });
  }

  public logout(): void {
    this.authService.disconnectWallet();
  }

  public getDropdownStatus(status: boolean): void {
    this.dropdownIsOpened = status;
  }

  public openRecentTradesModal(): void {
    this.modalService
      .openRecentTradesModal({
        size: this.headerStore.isMobile ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }

  public openLimitOrdersModal(): void {}

  public openProfileModal(): void {
    this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
  }
}
