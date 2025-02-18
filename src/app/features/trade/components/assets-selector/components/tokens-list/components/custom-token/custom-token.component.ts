import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { CustomTokenService } from '@features/trade/components/assets-selector/components/tokens-list/services/custom-token-service/custom-token.service';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { AssetsSelectorStateService } from '../../../../services/assets-selector-state/assets-selector-state.service';
import { TokenFilter } from '../../../../models/token-filters';
import { AssetType } from '@app/features/trade/models/asset';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CustomTokenService]
})
export class CustomTokenComponent {
  public readonly customToken$ = this.tokensListStoreService.customToken$;

  public get tokenFilter(): TokenFilter {
    return this.assetsSelectorStateService.tokenFilter;
  }

  public get assetType(): AssetType {
    return this.assetsSelectorStateService.assetType;
  }

  constructor(
    private readonly customTokenService: CustomTokenService,
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService
  ) {}

  /**
   * Opens 'accept import' modal and adds token to local token collection in case of acceptation.
   */
  public onImportClick(customToken: AvailableTokenAmount): void {
    this.customTokenService.openModal(customToken);
  }
}
