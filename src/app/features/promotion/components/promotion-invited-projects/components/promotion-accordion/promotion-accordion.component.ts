import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PromotionTableData } from '@features/promotion/models/promotion-table-data-item.interface';
import { TokensService } from '@core/services/tokens/tokens.service';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';

@Component({
  selector: 'app-promotion-accordion',
  templateUrl: './promotion-accordion.component.html',
  styleUrls: ['./promotion-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionAccordionComponent {
  @Input() tableData: PromotionTableData = [];

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  constructor(private readonly tokensService: TokensService) {}

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
