import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';

@Component({
  selector: 'app-tokens-list-element',
  templateUrl: './tokens-list-element.component.html',
  styleUrls: ['./tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListElementComponent {
  @Input() token: TokenAmount;

  constructor() {}
}
