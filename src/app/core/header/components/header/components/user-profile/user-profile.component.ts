import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  TemplateRef,
  Inject,
  Self
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDialogService } from '@taiga-ui/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HeaderStore } from '../../../../services/header.store';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RecentCrosschainTxComponent } from '@app/core/recent-trades/components/recent-crosschain-tx/recent-crosschain-tx.component';

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
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService
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

  public readonly isConfirmModalOpened$: Observable<boolean>;

  public readonly isMobile$: Observable<boolean>;

  public readonly currentUser$: Observable<UserInterface>;

  public currentBlockchain: BlockchainData;

  public dropdownIsOpened = false;

  public readonly unreadTrades$: Observable<number>;

  @ViewChildren('dropdownOptionTemplate') public dropdownItems: QueryList<TemplateRef<unknown>>;

  ngAfterViewInit(): void {
    this.walletConnectorService.networkChange$.pipe(takeUntil(this.destroy$)).subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.markForCheck();
    });
    this.walletConnectorService.addressChange$.pipe(takeUntil(this.destroy$)).subscribe(address => {
      this.authService.setCurrentUser(address);
      this.cdr.markForCheck();
    });
  }

  public logout(): void {
    this.authService.serverlessSignOut();
  }

  public getDropdownStatus(status: boolean): void {
    this.dropdownIsOpened = status;
  }

  public openRecentTradesModal(): void {
    const desktopModalSize = 'xl' as 'l'; // hack for custom modal size
    const mobileModalSize = 'page';

    this.dialogService
      .open(new PolymorpheusComponent(RecentCrosschainTxComponent), {
        size: this.headerStore.isMobile ? mobileModalSize : desktopModalSize
      })
      .subscribe();
  }
}
