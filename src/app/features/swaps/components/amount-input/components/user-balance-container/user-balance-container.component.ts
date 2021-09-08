import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';

@Component({
  selector: 'app-user-balance-container',
  templateUrl: './user-balance-container.component.html',
  styleUrls: ['./user-balance-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserBalanceContainerComponent {
  @Input() public token: TokenAmount;

  @Input() public hide: 'maxButton' | 'balance';

  @Input() public displayMaxButton: boolean = false;

  @Output() public maxButtonClickEvent: EventEmitter<void>;

  constructor() {
    this.maxButtonClickEvent = new EventEmitter<void>();
  }

  public maxButtonClick(): void {
    this.maxButtonClickEvent.emit();
  }
}
