import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { CustomTokenService } from '@features/trade/components/assets-selector/components/tokens-list/services/custom-token-service/custom-token.service';
import { AssetListType } from '@features/trade/models/asset';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CustomTokenService]
})
export class CustomTokenComponent {
  @Input({ required: true }) customToken: AvailableTokenAmount;

  @Input({ required: true }) listType: AssetListType;

  constructor(private readonly customTokenService: CustomTokenService) {}

  /**
   * Opens 'accept import' modal and adds token to local token collection in case of acceptation.
   */
  public onImportClick(customToken: AvailableTokenAmount): void {
    this.customTokenService.openModal(customToken);
  }
}
