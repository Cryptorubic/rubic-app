import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { TokensListType } from '@features/swaps/shared/components/tokens-select/models/tokens-list-type';

@Component({
  selector: 'app-switch-list-type-button',
  templateUrl: './switch-list-type-button.component.html',
  styleUrls: ['./switch-list-type-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchListTypeButtonComponent {
  public readonly listType$ = this.tokensSelectorService.listType$;

  constructor(private readonly tokensSelectorService: TokensSelectorService) {}

  public getIcon(listType: TokensListType): string {
    if (listType === 'default') {
      return 'star.svg';
    }
    return 'back.svg';
  }

  public getHintText(listType: TokensListType): string {
    if (listType === 'default') {
      return 'List of favorite tokens';
    }
    return 'Back to whole tokens list';
  }

  /**
   * Switches tokens display mode (default or favorite).
   */
  public switchMode(): void {
    this.tokensSelectorService.switchListType();
  }
}
