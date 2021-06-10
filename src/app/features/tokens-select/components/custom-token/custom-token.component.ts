import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenComponent {
  @Input() token: TokenAmount;

  constructor() {}
}
