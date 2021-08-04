import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { AbstractTuiThemeSwitcher } from '@taiga-ui/cdk';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

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

  private themeSubscription$: Subscription;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    @Inject(DOCUMENT) document: Document
  ) {
    super(document);
  }

  public ngOnInit(): void {
    this.themeSubscription$ = this.themeService
      .getTheme()
      .subscribe(theme => (this.isDark = theme === 'dark'));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.themeSubscription$.unsubscribe();
  }

  public switchTheme(): void {
    this.themeService.switchTheme();
  }
}
