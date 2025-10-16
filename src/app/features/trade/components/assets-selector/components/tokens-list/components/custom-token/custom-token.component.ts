import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { CustomTokenService } from '@features/trade/components/assets-selector/components/tokens-list/services/custom-token-service/custom-token.service';
import { AssetsSelectorStateService } from '../../../../services/assets-selector-state/assets-selector-state.service';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { Observable } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CustomTokenService]
})
export class CustomTokenComponent {
  @Input({ required: true }) type: 'from' | 'to';

  public get assetType(): AssetListType {
    return this.assetsSelectorFacade.getAssetsService(this.type).assetListType;
  }

  public get customToken$(): Observable<AvailableTokenAmount | null> {
    return this.assetsSelectorFacade.getAssetsService(this.type).customToken$;
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
