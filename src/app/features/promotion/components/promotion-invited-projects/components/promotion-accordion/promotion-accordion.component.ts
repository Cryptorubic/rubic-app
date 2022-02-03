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

  public currentPageIndex = 0;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  private readonly PAGE_LENGTH = 5;

  get pagesNumber(): number {
    if (!this.tableData) {
      return 0;
    }

    return Math.ceil(this.tableData.length / this.PAGE_LENGTH);
  }

  get pageTableData(): PromotionTableData {
    if (!this.tableData) {
      return [];
    }

    const fromIndex = this.currentPageIndex * this.PAGE_LENGTH;
    const toIndex = Math.min((this.currentPageIndex + 1) * this.PAGE_LENGTH, this.tableData.length);

    return this.tableData.slice(fromIndex, toIndex);
  }

  constructor(private readonly tokensService: TokensService) {}

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  public goToPage(index: number): void {
    this.currentPageIndex = index;
  }
}
