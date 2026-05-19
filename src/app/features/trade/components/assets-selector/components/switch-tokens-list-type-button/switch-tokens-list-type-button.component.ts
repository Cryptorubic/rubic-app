import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AssetListType } from '@features/trade/models/asset';

@Component({
  selector: 'app-switch-list-type-button',
  templateUrl: './switch-tokens-list-type-button.component.html',
  styleUrls: ['./switch-tokens-list-type-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchTokensListTypeButtonComponent {
  public icon = '';

  public hintText = '';

  @Input({ required: true }) set assetListType(value: AssetListType) {
    this.icon = value === 'favorite' ? 'back.svg' : 'star.svg';
    this.hintText = value === 'favorite' ? 'Back to whole tokens list' : 'List of favorite tokens';
  }

  @Output() switchListType = new EventEmitter<void>();

  constructor() {}

  /**
   * Switches tokens display mode (default or favorite).
   */
  public switchMode(): void {
    this.switchListType.emit();
  }
}
