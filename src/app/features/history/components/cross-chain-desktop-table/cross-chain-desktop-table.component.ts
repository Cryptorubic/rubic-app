import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { CrossChainTableData } from '@features/history/models/cross-chain-table-data';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { CommonTableService } from '../../services/common-table-service/common-table.service';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from '@cryptorubic/core';
import { tableRowsWithActionButtons } from './constants/status-to-action-cases';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ActionButtonLoadingStatus } from './model/types';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { BRIDGE_TYPE } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/bridge-type';

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

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly columns = crossChainCols;

  private readonly actionButtonsStatuses: ActionButtonLoadingStatus[] = [];

  public readonly data$ = this.crossChainTableSrvice.data$;

  public readonly loading$ = this.crossChainTableSrvice.loading$;

  public readonly direction$ = this.crossChainTableSrvice.direction$;

  public readonly sorter$ = this.crossChainTableSrvice.sorter$;

  public readonly page$ = this.crossChainTableSrvice.page$;

  public readonly totalPages$ = this.crossChainTableSrvice.totalPages$;

  constructor(
    private readonly crossChainTableSrvice: CrossChainTableService,
    private readonly commonTableService: CommonTableService,
    private readonly walletConnector: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensService: TokensService
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

  public shouldShowActionButton(item: CrossChainTableData): boolean {
    const shouldShow = tableRowsWithActionButtons.some(
      actionCase =>
        item.fromBlockchain.name === BLOCKCHAIN_NAME.ARBITRUM &&
        item.toTx.status.label === actionCase.status &&
        actionCase.provider === BRIDGE_PROVIDERS[BRIDGE_TYPE.ARBITRUM]
    );
    return shouldShow;
  }

  public async handleStatusToItemClick(item: CrossChainTableData): Promise<void> {
    const provider = item.provider;
    const fromBlockchain = item.fromBlockchain.name as EvmBlockchainName;
    const toBlockchain = item.toBlockchain.name as EvmBlockchainName;

    const status = this.startLoadingOnAction(item);

    if (
      provider === BRIDGE_PROVIDERS[BRIDGE_TYPE.ARBITRUM] &&
      fromBlockchain === BLOCKCHAIN_NAME.ARBITRUM
    ) {
      const isSwitched = await this.walletConnector.switchChain(toBlockchain);
      if (isSwitched) await this.commonTableService.claimArbitrumBridgeTokens(item.fromTx.hash);
    }

    status.isLoading = false;
    this.cdr.markForCheck();
  }

  public isLoadingActionButton(fromTxHash: string): boolean {
    return !!this.actionButtonsStatuses.find(status => status.fromTxHash === fromTxHash)?.isLoading;
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  private startLoadingOnAction(item: CrossChainTableData): ActionButtonLoadingStatus {
    let status = this.actionButtonsStatuses.find(el => el.fromTxHash === item.fromTx.hash);

    if (!status) {
      status = { fromTxHash: item.fromTx.hash, isLoading: true };
      this.actionButtonsStatuses.push(status);
    } else {
      status.isLoading = true;
    }

    return status;
  }
}
