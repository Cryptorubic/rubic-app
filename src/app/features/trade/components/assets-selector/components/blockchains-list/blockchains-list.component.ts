import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
  Optional
} from '@angular/core';
import { BlockchainName } from '@cryptorubic/sdk';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { FormType } from '@app/features/trade/models/form-type';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SelectorUtils } from '@features/trade/components/assets-selector/utils/selector-utils';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { allChainsSelectorItem } from '../../constants/all-chains';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent implements OnDestroy {
  @Input({ required: true }) type: 'from' | 'to';

  public get blockchainsToShow$(): Observable<AvailableBlockchain[]> {
    return this.assetsSelectorFacade.getAssetsService(this.type).blockchainsToShow$;
  }

  public readonly isMobile = this.headerStore.isMobile;

  public readonly allChainsSelectorItem = allChainsSelectorItem;

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { formType: FormType }>,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly mobileNativeService: MobileNativeModalService,
    public readonly formsTogglerService: FormsTogglerService,
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

  public get formType(): FormType {
    return this.context?.data?.formType || this.assetsSelectorStateService.formType;
  }

  ngOnDestroy(): void {
    this.closeBlockchainsList();
  }

  public getBlockchainTag(blockchain: AvailableBlockchain): string {
    return SelectorUtils.getBlockchainTag(blockchain);
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.assetsSelectorFacade.getAssetsService(this.type).isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    return this.assetsSelectorFacade.getAssetsService(this.type).getHintText(blockchain);
  }

  public closeBlockchainsList(): void {
    if (!this.isMobile) {
      this.assetsSelectorService.setSelectorListTypeByAssetType();
    }
  }

  public onItemClick(blockchainName: BlockchainName | null): void {
    if (blockchainName === null) this.assetsSelectorService.onAllChainsSelect();
    else this.assetsSelectorService.onBlockchainSelect(blockchainName);

    this.mobileNativeService.forceClose();
  }

  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;
}
