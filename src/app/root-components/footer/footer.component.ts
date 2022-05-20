import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { FOOTER_LINKS } from '@app/root-components/footer/models/footer-links';
import { ThemeService } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
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
