import { AsyncPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { HeaderStore } from '../../../../services/header.store';
import { Web3PrivateService } from '../../../../../services/blockchain/web3-private-service/web3-private.service';
import { IBlockchain } from '../../../../../../shared/models/blockchain/IBlockchain';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent {
  public readonly $isUserMenuOpened: Observable<boolean>;

  public readonly $isConfirmModalOpened: Observable<boolean>;

  public readonly $isMobile: Observable<boolean>;

  public readonly $currentUser: Observable<UserInterface>;

  public readonly $currentBlockchain: Observable<IBlockchain>;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly headerStore: HeaderStore,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly web3PrivateService: Web3PrivateService
  ) {
    this.$currentUser = this.authService.getCurrentUser();
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.$isUserMenuOpened = this.headerStore.getUserMenuOpeningStatus();
    this.$isConfirmModalOpened = this.headerStore.getConfirmModalOpeningStatus();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.headerStore.setUserMenuOpeningStatus(false);
        this.headerStore.setConfirmModalOpeningStatus(false);
      }
    });
    this.$currentBlockchain = web3PrivateService.onNetworkChanges;
  }

  @HostListener('document:mousedown', ['$event'])
  clickOutsideCOmponent(event): void {
    const isMenuOpened = new AsyncPipe(this.cdr).transform(
      this.headerStore.getUserMenuOpeningStatus()
    );
    const isConfirmModalOpened = new AsyncPipe(this.cdr).transform(
      this.headerStore.getConfirmModalOpeningStatus()
    );
    if (
      !this.elementRef.nativeElement.contains(event.target) &&
      isMenuOpened &&
      !isConfirmModalOpened
    ) {
      this.headerStore.setUserMenuOpeningStatus(false);
    }
  }

  public toggleMenu(): void {
    this.headerStore.toggleMenuOpeningStatus();
  }

  public toggleConfirmModal(): void {
    this.headerStore.toggleConfirmModalOpeningStatus();
  }
}
