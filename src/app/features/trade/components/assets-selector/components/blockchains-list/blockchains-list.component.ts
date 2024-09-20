import { ChangeDetectionStrategy, Component, Inject, OnDestroy, Optional } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { FormType } from '@app/features/trade/models/form-type';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { BlockchainTags } from '../blockchains-filter-list/models/BlockchainFilters';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent implements OnDestroy {
  public readonly blockchainsToShow$ = this.blockchainsListService.blockchainsToShow$;

  public readonly isMobile = this.headerStore.isMobile;

  private readonly blockchainsTags = BlockchainTags;

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { formType: FormType }>,
    private readonly blockchainsListService: BlockchainsListService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly mobileNativeService: MobileNativeModalService,
    public readonly formsTogglerService: FormsTogglerService,
    private readonly headerStore: HeaderStore
  ) {}

  public get formType(): FormType {
    return this.context?.data?.formType || this.assetsSelectorService.formType;
  }

  ngOnDestroy(): void {
    this.closeBlockchainsList();
  }

  public getBlockchainTag(blockchain: AvailableBlockchain): string {
    const tags = blockchain.tags
      .filter(tag => tag === this.blockchainsTags.PROMO || tag === this.blockchainsTags.NEW)
      .sort((a, b) => {
        if (a === this.blockchainsTags.PROMO) return -1;
        if (b === this.blockchainsTags.PROMO) return 1;
        return 0;
      });

    return tags[0];
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public closeBlockchainsList(): void {
    if (!this.isMobile) {
      this.assetsSelectorService.setSelectorListTypeByAssetType();
    }
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetsSelectorService.onBlockchainSelect(blockchainName);
    this.mobileNativeService.forceClose();
  }

  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;
}
