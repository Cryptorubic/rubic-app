import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { AbstractTuiThemeSwitcher } from '@taiga-ui/cdk';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-rubic-toggler-theme',
  templateUrl: './rubic-toggler-theme.component.html',
  styleUrls: ['./rubic-toggler-theme.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RubicTogglerThemeComponent extends AbstractTuiThemeSwitcher {
  public isDark: boolean;

  public readonly themeForm: FormGroup;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    @Inject(DOCUMENT) document: Document
  ) {
    super(document);
    this.isDark = this.themeService.isDark;
  }

  public switchTheme(): void {
    this.themeService.switchTheme();
  }
}
