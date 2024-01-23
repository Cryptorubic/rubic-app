import {
  Component,
  Inject,
  PLATFORM_ID,
  ViewChild,
  HostListener,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  Self,
  NgZone
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Router } from '@angular/router';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { WINDOW } from '@ng-web-apis/common';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { HeaderStore } from '../../services/header.store';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('headerPage') public headerPage: TemplateRef<unknown>;

  /**
   * Rubic advertisement type. Renders different components based on type.
   */
  public advertisementType: 'default' | 'custom';

  public SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly isMobileMenuOpened$: Observable<boolean>;

  public readonly isMobile$: Observable<boolean>;

  public currentUser$: Observable<UserInterface>;

  public readonly swapType$: Observable<SWAP_PROVIDER_TYPE>;

  public settingsOpened = false;

  public get noFrameLink(): string {
    return `${this.window.origin}${this.queryParamsService.noFrameLink}`;
  }

  public get rootPath(): boolean {
    return this.window.location.pathname === '/';
  }

  public get isRevokePage(): boolean {
    return (
      this.window.location.pathname === '/revoke-approval/revoke' ||
      this.window.location.pathname === '/revoke-approval'
    );
  }

  public get isStakingPage(): boolean {
    return (
      this.window.location.pathname === '/staking' ||
      this.window.location.pathname === '/staking/new-position'
    );
  }

  public get isFaucetsPage(): boolean {
    return this.window.location.pathname === '/faucets';
  }

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(
    startWith('dark'),
    map(theme => theme === 'dark')
  );

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly errorService: ErrorsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly tokensService: TokensService,
    @Inject(WINDOW) private readonly window: Window,
    @Inject(DOCUMENT) private readonly document: Document,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly zone: NgZone,
    private readonly themeService: ThemeService
  ) {
    this.advertisementType = 'default';
    this.currentUser$ = this.authService.currentUser$;
    this.isMobileMenuOpened$ = this.headerStore.getMobileMenuOpeningStatus();
    this.isMobile$ = this.headerStore.getMobileDisplayStatus();
    this.headerStore.setMobileDisplayStatus(this.window.innerWidth <= this.headerStore.mobileWidth);
    if (isPlatformBrowser(platformId)) {
      this.zone.runOutsideAngular(() => {
        this.setNotificationPosition();
        this.window.onscroll = () => {
          this.setNotificationPosition();
        };
      });
    }
  }

  public ngAfterViewInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.detectChanges());
  }

  /**
   * Set notification position based on window scroll and width.
   */
  private setNotificationPosition(): void {
    this.document.documentElement.style.setProperty('--scroll-size', '0');
  }

  /**
   * Triggering redefining status of using mobile.
   */
  @HostListener('window:resize', ['$event'])
  public onResize(): void {
    this.headerStore.setMobileDisplayStatus(this.window.innerWidth <= this.headerStore.mobileWidth);
  }

  public async navigateToSwaps(): Promise<void> {
    await this.router.navigate(['/'], { queryParamsHandling: 'merge' });
  }

  public handleMenuButtonClick(): void {
    this.gtmService.reloadGtmSession();
  }

  public switchTheme(): void {
    this.themeService.switchTheme();
  }
}
