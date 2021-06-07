import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-new-ui',
  templateUrl: './new-ui.component.html',
  styleUrls: ['./new-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewUiComponent {
  readonly avatarUrl = './assets/images/rubic-logo-main.svg';

  constructor() {}

  onClick(event: MouseEvent) {
    console.log('click', event);
  }
}
