import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rubic-menu',
  templateUrl: './rubic-menu.component.html',
  styleUrls: ['./rubic-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicMenuComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  public isOpened = false;

  public menuItems = [
    { title: 'About Company', link: 'about' },
    { title: 'FAQ', link: 'faq' },
    { title: 'Project', link: 'https://rubic.finance/' },
    { title: 'Team', link: 'team' }
  ];

  constructor(private router: Router) {}

  public getDropdownStatus(opened) {
    this.isOpened = opened;
  }

  public clickNavigate(link) {
    if (link.includes(location.protocol)) {
      window.open(link, '_blank');
    } else {
      console.log('dsf');
      this.router.navigate([link]);
    }
    this.isOpened = false;
  }
}
