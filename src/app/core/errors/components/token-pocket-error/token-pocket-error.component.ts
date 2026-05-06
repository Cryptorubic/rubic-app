import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-token-pocket-error',
  templateUrl: './token-pocket-error.component.html',
  styleUrls: ['./token-pocket-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TokenPocketErrorComponent {
  constructor() {}
}
