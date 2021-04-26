import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
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
export class UserProfileComponent implements AfterViewInit, OnDestroy {
  private clicks: number = 0;

  public readonly $isConfirmModalOpened: Observable<boolean>;

  public readonly $isMobile: Observable<boolean>;

  public readonly $currentUser: Observable<UserInterface>;

  public readonly $currentBlockchain: Observable<IBlockchain>;

  private _onNetworkChanges$: Subscription;

  private _onAddressChanges$: Subscription;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly headerStore: HeaderStore,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private web3PrivateService: Web3PrivateService,
    private readonly authService: AuthService
  ) {
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.$isConfirmModalOpened = this.headerStore.getConfirmModalOpeningStatus();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.headerStore.setMobileMenuOpeningStatus(false);
        this.headerStore.setConfirmModalOpeningStatus(false);
      }
    });
    this.$currentBlockchain = this.web3PrivateService.onNetworkChanges;
    this.$currentUser = this.authService.getCurrentUser();
  }

  ngAfterViewInit(): void {
    this._onNetworkChanges$ = this.web3PrivateService.onNetworkChanges.subscribe(() =>
      this.cdr.detectChanges()
    );
    this._onAddressChanges$ = this.web3PrivateService.onAddressChanges.subscribe(() =>
      this.cdr.detectChanges()
    );
  }

  ngOnDestroy(): void {
    this._onNetworkChanges$.unsubscribe();
    this._onAddressChanges$.unsubscribe();
  }

  public useTestingMode(): void {
    this.clicks++;
    const neededClicksAmount = 5;
    if (this.clicks === neededClicksAmount) {
      this.clicks = 0;
      (window as any).useTestingMode();
    }
  }

  public toggleConfirmModal(): void {
    this.headerStore.toggleConfirmModalOpeningStatus();
  }
}
