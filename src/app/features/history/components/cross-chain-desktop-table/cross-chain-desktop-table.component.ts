import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { CrossChainTableData } from '@features/history/models/cross-chain-table-data';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { CommonTableService } from '../../services/common-table-service/common-table.service';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'rubic-sdk';
import { CASES_WHEN_SHOW_BUTTON_IN_STATUS_TO } from './constants/status-to-action-cases';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

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
    private readonly commonTableService: CommonTableService,
    private readonly walletConnector: WalletConnectorService
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

  public shouldShowStatusToActionButton(item: CrossChainTableData): boolean {
    const shouldShow = CASES_WHEN_SHOW_BUTTON_IN_STATUS_TO.some(
      _case =>
        item.fromBlockchain.name === BLOCKCHAIN_NAME.ARBITRUM &&
        _case.status === item.toTx.status.label
    );
    return shouldShow;
  }

  public async handleStatusToItemClick(item: CrossChainTableData): Promise<void> {
    // const provider = item.provider.name;
    const fromBlockchain = item.fromBlockchain.name as EvmBlockchainName;
    const toBlockchain = item.toBlockchain.name as EvmBlockchainName;
    switch (fromBlockchain) {
      // case FROM_BACKEND_CROSS_CHAIN_PROVIDERS.rbc_arbitrum_bridge:
      case BLOCKCHAIN_NAME.ARBITRUM:
        const isSwitched = await this.walletConnector.switchChain(toBlockchain);
        if (isSwitched) this.commonTableService.claimArbitrumBridgeTokens(item.fromTx.hash);
        break;
      default:
        console.warn("Blockhain doesn't have onStatusToClick actions!");
        return;
    }
  }
}
