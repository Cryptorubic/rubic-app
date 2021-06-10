import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListComponent {
  @Input() tokens: TokenAmount[] = [];

  @Output() tokenSelect = new EventEmitter<TokenAmount>();

  constructor() {}
}
