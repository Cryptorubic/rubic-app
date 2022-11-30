import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  TemplateRef,
  Self
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { WalletConnectorService } from 'src/app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HeaderStore } from '../../../../services/header.store';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { map, takeUntil } from 'rxjs/operators';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { CommonModalService } from '@app/core/services/modal/common-modal.service';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class UserProfileComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<unknown>>;

  public readonly currentUser$ = this.authService.currentUser$;

  public readonly currentBlockchain$ = this.walletConnectorService.networkChange$.pipe(
    map(blockchainName => ({
      name: blockchainName,
      icon: blockchainName ? blockchainIcon[blockchainName] : ''
    }))
  );

  public dropdownIsOpened = false;

  public readonly unreadTrades$ = this.recentTradesStoreService.unreadTrades$;

  @ViewChildren('dropdownOptionTemplate') public dropdownItems: QueryList<TemplateRef<unknown>>;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly commonModalService: CommonModalService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.closeModalOnNavigaiton();
  }

  public logout(): void {
    this.authService.disconnectWallet();
  }

  public getDropdownStatus(status: boolean): void {
    this.dropdownIsOpened = status;
  }

  public openRecentTradesModal(): void {
    this.commonModalService
      .openRecentTradesModal({
        size: this.headerStore.isMobile ? 'page' : ('xl' as 'l') // hack for custom modal size
      })
      .subscribe();
  }

  private closeModalOnNavigaiton(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.headerStore.setMobileMenuOpeningStatus(false);
        this.headerStore.setConfirmModalOpeningStatus(false);
      }
    });
  }
}
