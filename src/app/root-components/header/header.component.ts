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
import { UserInterface } from '@core/services/auth/models/user.interface';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { StoreService } from '@core/services/store/store.service';
import { ErrorsService } from '@core/errors/errors.service';
import { Params, Router } from '@angular/router';
import { IframeService } from '@core/services/iframe/iframe.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SwapFormInput } from '@features/swaps/features/swaps-form/models/swap-form';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { WINDOW } from '@ng-web-apis/common';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { MyTradesService } from '@features/my-trades/services/my-trades.service';
import { BuyTokenComponent } from '@shared/components/buy-token/buy-token.component';
import { HeaderStore } from '@app/root-components/header/services/header.store';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { TokensService } from '@core/services/tokens/tokens.service';

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

  public isSettingsOpened = false;

  public get noFrameLink(): string {
    return `${this.window.origin}${this.queryParamsService.noFrameLink}`;
  }

  public get rootPath(): boolean {
    return this.window.location.pathname === '/';
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly iframeService: IframeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly storeService: StoreService,
    private readonly router: Router,
    private readonly errorService: ErrorsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly swapFormService: SwapFormService,
    private readonly swapsService: SwapsService,
    private readonly myTradesService: MyTradesService,
    private readonly tokensService: TokensService,
    @Inject(WINDOW) private readonly window: Window,
    @Inject(DOCUMENT) private readonly document: Document,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly zone: NgZone
  ) {
    this.loadUser();
    this.advertisementType = 'default';
    this.currentUser$ = this.authService.getCurrentUser();
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
    this.swapType$ = this.swapsService.swapMode$;
  }

  public ngAfterViewInit(): void {
    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.detectChanges());
  }

  /**
   * Set notification position based on window scroll and width.
   */
  private setNotificationPosition(): void {
    const offset = 90;
    const pixelOffset = `${this.window.scrollY < offset ? offset : 0}px`;
    this.document.documentElement.style.setProperty('--scroll-size', pixelOffset);
  }

  private async loadUser(): Promise<void> {
    const { isIframe } = this.iframeService;
    this.storeService.fetchData();
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
  public onResize(): void {
    this.headerStore.setMobileDisplayStatus(this.window.innerWidth <= this.headerStore.mobileWidth);
  }

  public async navigateToSwaps(
    fromToken?: TokenAmount,
    toToken?: TokenAmount,
    amount?: BigNumber
  ): Promise<void> {
    const form = this.swapFormService.commonTrade.controls.input;
    const params = {
      fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
      toBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
      fromToken: fromToken || null,
      toToken: toToken || null,
      fromAmount: amount || null
    } as SwapFormInput;
    form.patchValue(params);

    this.gtmService.reloadGtmSession();

    await this.router.navigate(['/'], {
      queryParams: {
        fromChain: BLOCKCHAIN_NAME.ETHEREUM,
        toChain: BLOCKCHAIN_NAME.ETHEREUM,
        amount: fromToken || undefined,
        from: toToken || undefined,
        to: amount || undefined
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

    const queryParams: Params = {
      fromChain: BLOCKCHAIN_NAME.ETHEREUM,
      toChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      amount: undefined,
      from: undefined,
      to: undefined
    };

    if (type === 'bridge') {
      this.swapsService.swapMode = SWAP_PROVIDER_TYPE.BRIDGE;
      queryParams.amount = 1000;
      queryParams.from = 'RBC';
      queryParams.to = 'BRBC';

      params.fromToken = this.tokensService.tokens.find(token => token.symbol === 'RBC');
      params.toToken = this.tokensService.tokens.find(token => token.symbol === 'BRBC');
      params.fromAmount = new BigNumber(1000);
    } else {
      this.swapsService.swapMode = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }

    this.swapFormService.input.patchValue(params);
    this.gtmService.reloadGtmSession();
    await this.router.navigate(['/'], { queryParams, queryParamsHandling: 'merge' });
  }

  public handleMenuButtonClick(): void {
    this.gtmService.reloadGtmSession();
  }
}
