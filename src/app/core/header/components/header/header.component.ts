import {
  Component,
  Inject,
  PLATFORM_ID,
  ViewChild,
  HostListener,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { HeaderStore } from '../../services/header.store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  public readonly $isMobileMenuOpened: Observable<boolean>;

  public readonly $isMobile: Observable<boolean>;

  @ViewChild('headerPage') public headerPage: TemplateRef<any>;

  public pageScrolled: boolean;

  public $currentUser: Observable<UserInterface>;

  constructor(
    @Inject(PLATFORM_ID) platformId,
    private readonly headerStore: HeaderStore,
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.loadUser();
    this.$currentUser = this.authService.getCurrentUser();
    this.pageScrolled = false;
    this.$isMobileMenuOpened = this.headerStore.getMobileMenuOpeningStatus();
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.headerStore.setMobileDisplayStatus(window.innerWidth <= this.headerStore.mobileWidth);
    if (isPlatformBrowser(platformId)) {
      const scrolledHeight = 50;
      window.onscroll = () => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        this.pageScrolled = scrolled > scrolledHeight;
      };
    }
  }

  private async loadUser(): Promise<void> {
    const isIframe = new AsyncPipe(this.cdr).transform(this.queryParamsService.$isIframe);
    if (isIframe) {
      await this.authService.signIn(true);
    } else {
      await this.authService.loadUser();
    }
  }

  /**
   * Triggering redefining status of using mobile.
   */
  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.headerStore.setMobileDisplayStatus(window.innerWidth <= this.headerStore.mobileWidth);
  }
}
