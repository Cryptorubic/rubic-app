import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BlockchainsListService } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AvailableBlockchain } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { BlockchainName } from 'rubic-sdk';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent implements OnInit, OnDestroy {
  public readonly blockchainsToShow$ = this.blockchainsListService.blockchainsToShow$;

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
}
