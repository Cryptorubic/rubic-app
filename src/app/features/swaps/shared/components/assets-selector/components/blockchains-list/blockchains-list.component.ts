import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BlockchainsListService } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { BlockchainName } from 'rubic-sdk';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { map } from 'rxjs';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent implements OnInit, OnDestroy {
  public readonly blockchainsToShow$ = this.blockchainsListService.blockchainsToShow$.pipe(
    map(blockchains => [
      ...blockchains.slice(0, 8),
      ...blockchains.slice(8, blockchains.length - 1).sort((a, b) => a.name.localeCompare(b.name))
    ])
  );

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly mobileNativeService: MobileNativeModalService
  ) {}

  ngOnInit(): void {
    this.assetsSelectorService.openBlockchainsList();
  }

  ngOnDestroy(): void {
    this.assetsSelectorService.setSelectorListTypeByAssetType();
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public closeBlockchainsList(): void {
    this.assetsSelectorService.setSelectorListTypeByAssetType();
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetsSelectorService.onBlockchainSelect(blockchainName);
    this.mobileNativeService.forceClose();
  }

  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;
}
