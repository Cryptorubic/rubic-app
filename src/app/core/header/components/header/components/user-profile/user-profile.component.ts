import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Self } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { WalletConnectorService } from 'src/app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HeaderStore } from '../../../../services/header.store';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TradesHistory } from '@core/header/components/header/components/mobile-user-profile/models/tradeHistory';
import { BlockchainName } from 'rubic-sdk';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class UserProfileComponent {
  constructor(
    private readonly headerStore: HeaderStore,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
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

    this.walletConnectorService.networkChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async blockchainName => {
        this.currentBlockchainName = blockchainName;
        this.currentBlockchainIcon = blockchainName ? blockchainIcon[blockchainName] : '';

        await this.authService.setSpaceIdData();

        this.cdr.markForCheck();
      });

    this.walletConnectorService.addressChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        await this.authService.setSpaceIdData();
      });

    this.currentUser$ = this.authService.currentUser$;
  }

  public readonly isConfirmModalOpened$: Observable<boolean>;

  public readonly isMobile$: Observable<boolean>;

  public currentUser$: Observable<UserInterface>;

  public currentBlockchainName: BlockchainName;

  public currentBlockchainIcon: string;

  public dropdownIsOpened = false;

  public spaceIdData$ = this.authService.spaceIdData$;

  public logout(): void {
    this.authService.disconnectWallet();
  }

  public getDropdownStatus(status: boolean): void {
    this.dropdownIsOpened = status;
  }

  public openLimitOrdersModal(): void {}

  public openProfileModal(): void {
    this.modalService.openUserProfile(TradesHistory.CROSS_CHAIN).subscribe();
  }
}
