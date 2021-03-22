import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-header-logotype',
  templateUrl: './header-logotype.component.html',
  styleUrls: ['./header-logotype.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderLogotypeComponent {
  @Input() public logoImagePath: string = 'assets/images/rubic-logo.svg?_=2';

  @Input() public logoRouterLink: string = '/trades';

  constructor() {}
}
