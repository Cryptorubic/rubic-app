import {
  Component,
  Inject,
  PLATFORM_ID,
  ViewChild,
  HostListener,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Router } from '@angular/router';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { WINDOW } from '@ng-web-apis/common';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { HeaderStore } from '../../services/header.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('headerPage') public headerPage: TemplateRef<unknown>;

  public SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly $isMobileMenuOpened: Observable<boolean>;

  public readonly $isMobile: Observable<boolean>;

  public pageScrolled: boolean;

  public $currentUser: Observable<UserInterface>;

  public countNotifications$: Observable<number>;

  public readonly swapType$: Observable<SWAP_PROVIDER_TYPE>;

  public get noFrameLink(): string {
    return `https://rubic.exchange${this.queryParamsService.noFrameLink}`;
  }

  public get rootPath(): boolean {
    return this.window.location.pathname === '/';
  }

  constructor(
    @Inject(PLATFORM_ID) platformId,
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly iframeService: IframeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly storeService: StoreService,
    private router: Router,
    private readonly errorService: ErrorsService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly swapFormService: SwapFormService,
    private readonly swapsService: SwapsService,
    @Inject(WINDOW) private readonly window: Window,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.loadUser();
    this.$currentUser = this.authService.getCurrentUser();
    this.pageScrolled = false;
    this.$isMobileMenuOpened = this.headerStore.getMobileMenuOpeningStatus();
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.headerStore.setMobileDisplayStatus(this.window.innerWidth <= this.headerStore.mobileWidth);
    if (isPlatformBrowser(platformId)) {
      const scrolledHeight = 50;
      this.window.onscroll = () => {
        const scrolled = this.window.pageYOffset || this.document.documentElement.scrollTop;
        this.pageScrolled = scrolled > scrolledHeight;
      };
    }
    this.countNotifications$ = this.counterNotificationsService.unread$;
    this.swapType$ = this.swapsService.swapMode$;
  }

  public ngAfterViewInit(): void {
    this.authService.getCurrentUser().subscribe(() => this.cdr.detectChanges());
  }

  private async loadUser(): Promise<void> {
    const { isIframe } = this.iframeService;
    this.storeService.fetchData(isIframe);
    if (!isIframe) {
      try {
        await this.authService.loadUser();
      } catch (err) {
        this.errorService.catch(err);
      }
    }
  }

  /**
   * Triggering redefining status of using mobile.
   */
  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.headerStore.setMobileDisplayStatus(this.window.innerWidth <= this.headerStore.mobileWidth);
  }

  public async navigateToSwaps(): Promise<void> {
    const form = this.swapFormService.commonTrade.controls.input;
    const params = {
      fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
      toBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
      fromToken: null,
      toToken: null,
      fromAmount: null
    } as SwapFormInput;
    form.patchValue(params);
    await this.router.navigate(['/'], {
      queryParams: {
        fromChain: BLOCKCHAIN_NAME.ETHEREUM,
        toChain: BLOCKCHAIN_NAME.ETHEREUM,
        amount: undefined,
        from: undefined,
        to: undefined
      },
      queryParamsHandling: 'merge'
    });
  }

  public async navigateToBridgeOrCrossChain(type: 'bridge' | 'cross-chain'): Promise<void> {
    const params = {
      fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
      toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      fromToken: null,
      toToken: null,
      fromAmount: null
    } as SwapFormInput;
    this.swapFormService.input.patchValue(params);

    if (type === 'bridge') {
      this.swapsService.swapMode = SWAP_PROVIDER_TYPE.BRIDGE;
    } else {
      this.swapsService.swapMode = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }

    await this.router.navigate(['/'], {
      queryParams: {
        fromChain: BLOCKCHAIN_NAME.ETHEREUM,
        toChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        amount: undefined,
        from: undefined,
        to: undefined
      },
      queryParamsHandling: 'merge'
    });
  }
}
