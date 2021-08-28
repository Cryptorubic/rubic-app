import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { AbstractTuiThemeSwitcher } from '@taiga-ui/cdk';
import { DOCUMENT } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';

@Component({
  selector: 'app-rubic-toggler-theme',
  templateUrl: './rubic-toggler-theme.component.html',
  styleUrls: ['./rubic-toggler-theme.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RubicTogglerThemeComponent
  extends AbstractTuiThemeSwitcher
  implements OnInit, OnDestroy
{
  public isDark: boolean;

  public isIframe$: Observable<boolean>;

  private themeSubscription$: Subscription;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    @Inject(DOCUMENT) document: Document,
    iframeService: IframeService
  ) {
    super(document);
    this.isIframe$ = iframeService.isIframe$;
  }

  public ngOnInit(): void {
    this.themeSubscription$ = this.themeService.theme$.subscribe(
      theme => (this.isDark = theme === 'dark')
    );
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.themeSubscription$.unsubscribe();
  }

  public switchTheme(): void {
    this.themeService.switchTheme();
  }
}
