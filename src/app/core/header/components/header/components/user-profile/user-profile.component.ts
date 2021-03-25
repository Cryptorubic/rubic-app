import { AsyncPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { HeaderStore } from '../../../../services/header.store';
import { AuthService } from '../../../../../services/auth/auth.service';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements AfterViewInit {
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
    private web3PrivateService: Web3PrivateService,
    private readonly authService: AuthService
  ) {
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.$isUserMenuOpened = this.headerStore.getUserMenuOpeningStatus();
    this.$isConfirmModalOpened = this.headerStore.getConfirmModalOpeningStatus();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.headerStore.setUserMenuOpeningStatus(false);
        this.headerStore.setConfirmModalOpeningStatus(false);
      }
    });
    this.$currentBlockchain = this.web3PrivateService.onNetworkChanges;
    this.$currentUser = this.authService.getCurrentUser();
  }

  public ngAfterViewInit(): void {
    this.web3PrivateService.onNetworkChanges.subscribe(() => this.cdr.detectChanges());
    this.web3PrivateService.onAddressChanges.subscribe(() => this.cdr.detectChanges());
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
