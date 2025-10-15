import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { CustomTokenService } from '@features/trade/components/assets-selector/components/tokens-list/services/custom-token-service/custom-token.service';
import { AssetsSelectorStateService } from '../../../../services/assets-selector-state/assets-selector-state.service';
import { TokenFilter } from '../../../../models/token-filters';
import { AssetType } from '@app/features/trade/models/asset';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CustomTokenService]
})
export class CustomTokenComponent {
  @Input({ required: true }) type: 'from' | 'to';

  public get customToken$(): Observable<AvailableTokenAmount | null> {
    return this.assetsSelectorFacade.getAssetsService(this.type).customToken$;
  }

  public get tokenFilter(): TokenFilter {
    return this.assetsSelectorStateService.tokenFilter;
  }

  public get assetType(): AssetType {
    return this.assetsSelectorStateService.assetType;
  }

  constructor(
    private readonly customTokenService: CustomTokenService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

  /**
   * Opens 'accept import' modal and adds token to local token collection in case of acceptation.
   */
  public onImportClick(customToken: AvailableTokenAmount): void {
    this.customTokenService.openModal(customToken);
  }
}
