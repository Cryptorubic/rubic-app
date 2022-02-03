import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { TokensService } from '@core/services/tokens/tokens.service';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';

@Component({
  selector: 'app-promotion-table',
  templateUrl: './promotion-table.component.html',
  styleUrls: ['./promotion-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionTableComponent {
  @Input() tableData: PromotionTableData = [];

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly columns = [
    'projectUrl',
    'invitationDate',
    'tradingVolume',
    'received',
    'receivedTokens'
  ];

  constructor(private readonly tokensService: TokensService) {}

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
