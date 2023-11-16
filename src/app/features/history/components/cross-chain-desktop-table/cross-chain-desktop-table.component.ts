import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { CrossChainTableData } from '@features/history/models/cross-chain-table-data';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { CommonTableService } from '../../services/common-table-service/common-table.service';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

const crossChainCols = ['from', 'to', 'date', 'statusFrom', 'statusTo', 'provider'] as const;

@Component({
  selector: 'app-cross-chain-desktop-table',
  templateUrl: './cross-chain-desktop-table.component.html',
  styleUrls: ['./cross-chain-desktop-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainDesktopTableComponent {
  @Input({ required: true }) device: 'mobile' | 'desktop' | 'tablet';

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  public readonly columns = crossChainCols;

  public readonly data$ = this.crossChainTableSrvice.data$;

  public readonly loading$ = this.crossChainTableSrvice.loading$;

  public readonly direction$ = this.crossChainTableSrvice.direction$;

  public readonly sorter$ = this.crossChainTableSrvice.sorter$;

  public readonly page$ = this.crossChainTableSrvice.page$;

  public readonly totalPages$ = this.crossChainTableSrvice.totalPages$;

  constructor(
    private readonly crossChainTableSrvice: CrossChainTableService,
    private readonly commonTableService: CommonTableService
  ) {}

  public changeDirection(direction: 1 | -1): void {
    this.crossChainTableSrvice.onDirection(direction);
  }

  public changePage(page: number): void {
    this.crossChainTableSrvice.onPage(page);
  }

  public changeSorting(sorting: unknown): void {
    const sort = sorting as (typeof crossChainCols)[number];
    if (sort === 'date') {
      this.crossChainTableSrvice.onSorting('created_at');
    }
  }

  public getItem(
    innerItem: Partial<Record<keyof CrossChainTableData, RubicAny>>
  ): CrossChainTableData {
    return innerItem as unknown as CrossChainTableData;
  }

  public handleStatusToItemClick(item: CrossChainTableData): void {
    const fromBlockchain = item.fromBlockchain.name;
    switch (fromBlockchain) {
      case BLOCKCHAIN_NAME.ARBITRUM:
        this.commonTableService.claimArbitrumBridgeTokens(item.toTx.hash);
        break;
      default:
        console.warn("Blockhain hasn't onStatusToClick actions!");
        return;
    }
  }
}
