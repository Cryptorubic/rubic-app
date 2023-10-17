import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';

@Component({
  selector: 'app-switch-list-type-button',
  templateUrl: './switch-tokens-list-type-button.component.html',
  styleUrls: ['./switch-tokens-list-type-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchTokensListTypeButtonComponent {
  public readonly buttonData$ = this.tokensListTypeService.listType$.pipe(
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

  constructor(private readonly tokensListTypeService: TokensListTypeService) {}

  /**
   * Switches tokens display mode (default or favorite).
   */
  public switchMode(): void {
    this.tokensListTypeService.switchListType();
  }
}
