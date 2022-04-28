import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { FOOTER_LINKS } from '@core/rubic-footer/models/footer-links';
import { ThemeService } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-rubic-footer',
  templateUrl: './rubic-footer.component.html',
  styleUrls: ['./rubic-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicFooterComponent {
  public readonly footerLinks = FOOTER_LINKS;

  public readonly year = new Date().getFullYear();

  public readonly theme$ = this.themeService.theme$;

  /**
   * Returns landing domain address.
   */
  public get landingDomain(): string {
    return EXTERNAL_LINKS.LANDING;
  }

  constructor(private readonly themeService: ThemeService) {}
}
