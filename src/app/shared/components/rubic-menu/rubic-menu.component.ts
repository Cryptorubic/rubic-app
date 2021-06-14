import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';

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
    { title: 'About Company', link: '#' },
    { title: 'FAQ', link: '#' },
    { title: 'Project', link: '#' },
    { title: 'Team', link: '#' }
  ];

  constructor() {}

  public getDropdownStatus(opened) {
    this.isOpened = opened;
  }
}
