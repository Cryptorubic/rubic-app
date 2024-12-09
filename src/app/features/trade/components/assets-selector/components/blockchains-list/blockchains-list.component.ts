import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { map } from 'rxjs';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent implements OnDestroy {
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

  ngOnDestroy(): void {
    this.assetsSelectorService.setSelectorListTypeByAssetType();
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    console.log(blockchain);
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
