import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ShieldedBalanceToken } from '../../models/shielded-balance-token';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';

@Component({
  selector: 'app-shielded-tokens-list-element',
  templateUrl: './shielded-tokens-list-element.component.html',
  styleUrls: ['./shielded-tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShieldedTokensListElementComponent {
  @Input({ required: true }) token: ShieldedBalanceToken;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }
}
