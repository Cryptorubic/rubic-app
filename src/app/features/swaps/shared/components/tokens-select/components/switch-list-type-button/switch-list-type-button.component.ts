import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-switch-list-type-button',
  templateUrl: './switch-list-type-button.component.html',
  styleUrls: ['./switch-list-type-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchListTypeButtonComponent {
  public readonly buttonData$ = this.tokensSelectorService.listType$.pipe(
    map(listType => {
      const icon = listType === 'default' ? 'star.svg' : 'back.svg';
      const hintText =
        listType === 'default' ? 'List of favorite tokens' : 'Back to whole tokens list';
      return {
        icon,
        hintText
      };
    })
  );

  constructor(private readonly tokensSelectorService: TokensSelectorService) {}

  /**
   * Switches tokens display mode (default or favorite).
   */
  public switchMode(): void {
    this.tokensSelectorService.switchListType();
  }
}
