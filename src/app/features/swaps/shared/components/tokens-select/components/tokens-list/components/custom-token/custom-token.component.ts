import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomTokenService } from '@features/swaps/shared/components/tokens-select/components/tokens-list/services/custom-token-service/custom-token.service';
import { TokensListService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list.service';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CustomTokenService]
})
export class CustomTokenComponent {
  public readonly token = this.tokensListService.customToken;

  constructor(
    private readonly customTokenService: CustomTokenService,
    private readonly tokensListService: TokensListService
  ) {}

  /**
   * Opens 'accept import' modal and adds token to local token collection in case of acceptation.
   */
  public onImportClick(): void {
    this.customTokenService.openModal(this.token);
  }
}
