import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-metamask-error',
  templateUrl: './metamask-error.component.html',
  styleUrls: ['./metamask-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetamaskErrorComponent {
  constructor() {}
}
