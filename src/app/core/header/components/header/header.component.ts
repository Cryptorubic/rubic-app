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
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { WINDOW } from '@ng-web-apis/common';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BuyTokenComponent } from '@shared/components/buy-token/buy-token.component';
import { HeaderStore } from '../../services/header.store';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { ThemeService } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('headerPage') public headerPage: TemplateRef<unknown>;

  @ViewChild(BuyTokenComponent) public buyTokenComponent: BuyTokenComponent;

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

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(
    startWith('dark'),
    map(theme => theme === 'dark')
  );

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly iframeService: IframeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly errorService: ErrorsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly swapTypeService: SwapTypeService,
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
    this.swapType$ = this.swapTypeService.swapMode$;
    setInterval(() => {
      console.log(this.settingsOpened);
    }, 500);
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
    const offset = 90;
    const pixelOffset = `${this.window.scrollY < offset ? offset : 0}px`;
    this.document.documentElement.style.setProperty(
      '--scroll-size',
      this.iframeService.iframeAppearance === 'horizontal' ? '0' : pixelOffset
    );
  }

  /**
   * Triggering redefining status of using mobile.
   */
  @HostListener('window:resize', ['$event'])
  public onResize(): void {
    this.headerStore.setMobileDisplayStatus(this.window.innerWidth <= this.headerStore.mobileWidth);
  }

  public async navigateToSwaps(): Promise<void> {
    await this.swapTypeService.navigateToSwaps();
  }

  public async navigateToLimitOrder(): Promise<void> {
    await this.swapTypeService.navigateToLimitOrder();
  }

  public handleMenuButtonClick(): void {
    this.gtmService.reloadGtmSession();
  }
}
