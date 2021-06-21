import { Component } from '@angular/core';
import { footerLinks } from 'src/app/core/rubic-footer/models/footer-links';
import { FooterLink } from 'src/app/core/rubic-footer/models/footer-link';

@Component({
  selector: 'app-rubic-footer',
  templateUrl: './rubic-footer.component.html',
  styleUrls: ['./rubic-footer.component.scss']
})
export class RubicFooterComponent {
  public readonly footerLinks: FooterLink[];

  public readonly year: number;

  constructor() {
    this.year = new Date().getFullYear();
    this.footerLinks = footerLinks;
  }
}
