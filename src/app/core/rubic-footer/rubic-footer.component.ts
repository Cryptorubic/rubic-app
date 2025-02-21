import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { FOOTER_LINKS } from '@core/rubic-footer/models/footer-links';
import { ThemeService } from '@core/services/theme/theme.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { map } from 'rxjs';

@Component({
  selector: 'app-rubic-footer',
  templateUrl: './rubic-footer.component.html',
  styleUrls: ['./rubic-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('showFigure', [
      state('true', style({ opacity: 1, bottom: 0, display: 'block' })),
      state('false', style({ opacity: 0, bottom: '-100px', display: 'none' })),
      transition('false <=> true', animate('0.5s ease-in-out'))
    ]),
    trigger('showTowerLeft', [
      state('true', style({ opacity: 1, left: 0, display: 'block' })),
      state('false', style({ opacity: 0, left: '-100px', display: 'none' })),
      transition('false <=> true', animate('0.4s ease-in-out'))
    ]),
    trigger('showTowerRight', [
      state('true', style({ opacity: 1, right: 0, display: 'block' })),
      state('false', style({ opacity: 0, right: '-100px', display: 'none' })),
      transition('false <=> true', animate('0.4s ease-in-out'))
    ])
  ]
})
export class RubicFooterComponent {
  public readonly footerLinks = FOOTER_LINKS;

  public readonly year = new Date().getFullYear();

  public readonly theme$ = this.themeService.theme$;

  public isMonaBgTheme$ = this.themeService.mainBgTheme$.pipe(map(theme => theme === 'monad'));

  /**
   * Returns landing domain address.
   */
  public get landingDomain(): string {
    return EXTERNAL_LINKS.LANDING;
  }

  constructor(private readonly themeService: ThemeService) {}
}
