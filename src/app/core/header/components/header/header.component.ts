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
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { Observable, Subject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Router } from '@angular/router';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { HeaderStore } from '../../services/header.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit {
  public readonly $isMobileMenuOpened: Observable<boolean>;

  public readonly $isMobile: Observable<boolean>;

  @ViewChild('headerPage') public headerPage: TemplateRef<any>;

  public pageScrolled: boolean;

  public $currentUser: Observable<UserInterface>;

  public $trades: Observable<TableTrade[]>;

  public countNotifications: number;

  constructor(
    @Inject(PLATFORM_ID) platformId,
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly storeService: StoreService,
    private router: Router,
    private readonly errorService: ErrorsService,
    private readonly myTradesService: MyTradesService,
    private readonly counterNotificationsService: CounterNotificationsService
  ) {
    this.loadUser();
    this.$currentUser = this.authService.getCurrentUser();
    this.counterNotificationsService.unreadTradesChange.subscribe(res => {
      this.countNotifications = res;
      this.cdr.detectChanges();
    });
    this.pageScrolled = false;
    this.$isMobileMenuOpened = this.headerStore.getMobileMenuOpeningStatus();
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.$trades = myTradesService.tableTrades$;
    this.headerStore.setMobileDisplayStatus(window.innerWidth <= this.headerStore.mobileWidth);
    if (isPlatformBrowser(platformId)) {
      const scrolledHeight = 50;
      window.onscroll = () => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        this.pageScrolled = scrolled > scrolledHeight;
      };
    }
  }

  public ngAfterViewInit(): void {
    this.authService.getCurrentUser().subscribe(() => this.cdr.detectChanges());
  }

  private async loadUser(): Promise<void> {
    const isIframe = new AsyncPipe(this.cdr).transform(this.queryParamsService.isIframe$);
    this.storeService.fetchData(isIframe);
    if (!isIframe) {
      try {
        await this.authService.loadUser();
      } catch (err) {
        this.errorService.catch$(err);
      }
    }
  }

  /**
   * Triggering redefining status of using mobile.
   */
  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.headerStore.setMobileDisplayStatus(window.innerWidth <= this.headerStore.mobileWidth);
  }

  isLinkActive(url) {
    return window.location.pathname === url;
  }
}
