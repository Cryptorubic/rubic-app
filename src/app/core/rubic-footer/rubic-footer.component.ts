import { Component } from '@angular/core';
import { FooterLink } from 'src/app/core/rubic-footer/models/footer-link';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { FooterLinks } from '@core/rubic-footer/models/footer-links';

@Component({
  selector: 'app-rubic-footer',
  templateUrl: './rubic-footer.component.html',
  styleUrls: ['./rubic-footer.component.scss']
})
export class RubicFooterComponent {
  public readonly footerLinks: FooterLink[];

  public readonly year: number;

  /**
   * Returns landing domain address.
   */
  public get landingDomain(): string {
    return EXTERNAL_LINKS.LANDING;
  }

  constructor() {
    this.year = new Date().getFullYear();
    this.footerLinks = FooterLinks;
  }
}
