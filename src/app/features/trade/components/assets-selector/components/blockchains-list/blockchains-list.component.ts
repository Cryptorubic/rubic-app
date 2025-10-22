import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output
} from '@angular/core';
import { BlockchainName } from '@cryptorubic/sdk';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { FormType } from '@app/features/trade/models/form-type';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { allChainsSelectorItem } from '../../constants/all-chains';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { Observable } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';
import { SelectorUtils } from '@features/trade/components/assets-selector/utils/selector-utils';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent {
  @Input({ required: true }) type: 'from' | 'to';

  @Input({ required: true }) searchQuery: string;

  @Input({ required: true }) isDisabled: boolean = false;

  @Input({ required: true }) hintText: string;

  @Input({ required: true }) totalBlockchains: number;

  @Output() handleSearchQuery = new EventEmitter<string>();

  @Output() handleSelection = new EventEmitter<AssetListType>();

  public get blockchainsToShow$(): Observable<AvailableBlockchain[]> {
    return this.assetsSelectorFacade.getAssetsService(this.type).blockchainsToShow$;
  }

  public readonly isMobile = this.headerStore.isMobile;

  public readonly allChainsSelectorItem = allChainsSelectorItem;

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { formType: FormType }>,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

  public onItemClick(blockchainName: BlockchainName | null): void {
    if (blockchainName === null) {
      this.handleSelection.emit('allChains');
    } else {
      this.handleSelection.emit(blockchainName);
    }

    this.mobileNativeService.forceClose();
  }

  public getBlockchainTag(blockchain: AvailableBlockchain): string {
    return SelectorUtils.getBlockchainTag(blockchain);
  }
}
