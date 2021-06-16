import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { AvailableTokenAmount } from '../../../../shared/models/tokens/AvailableTokenAmount';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListComponent {
  @Input() tokens: AvailableTokenAmount[] = [];

  @Output() tokenSelect = new EventEmitter<AvailableTokenAmount>();

  constructor() {}

  onTokenSelect(token: AvailableTokenAmount) {
    this.tokenSelect.emit(token);
  }
}
