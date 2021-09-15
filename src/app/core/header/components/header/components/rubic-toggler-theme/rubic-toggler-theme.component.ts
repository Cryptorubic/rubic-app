import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { AbstractTuiThemeSwitcher, TuiDestroyService } from '@taiga-ui/cdk';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-rubic-toggler-theme',
  templateUrl: './rubic-toggler-theme.component.html',
  styleUrls: ['./rubic-toggler-theme.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RubicTogglerThemeComponent extends AbstractTuiThemeSwitcher {
  public isDark$: Observable<boolean>;

  public isIframe$: Observable<boolean>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    private readonly destroy$: TuiDestroyService,
    @Inject(DOCUMENT) document: Document,
    iframeService: IframeService
  ) {
    super(document);
    this.isIframe$ = iframeService.isIframe$;
    this.isDark$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));
  }

  /**
   * @description toggle theme on dark or light
   * @return void
   */
  public switchTheme(): void {
    this.themeService.switchTheme();
  }
}
