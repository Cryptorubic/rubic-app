import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-metamask-error',
  templateUrl: './metamask-error.component.html',
  styleUrls: ['./metamask-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetamaskErrorComponent {
  constructor() {}
}
