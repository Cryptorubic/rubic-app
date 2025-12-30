import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output
} from '@angular/core';
import { BlockchainName } from '@cryptorubic/core';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { allChainsSelectorItem } from '../../constants/all-chains';
import { AssetListType } from '@features/trade/models/asset';
import { SelectorUtils } from '@features/trade/components/assets-selector/utils/selector-utils';
import { PolymorpheusInput } from '@shared/decorators/polymorpheus-input';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent {
  @PolymorpheusInput()
  @Input({ required: true })
  type: 'from' | 'to' = this.context?.data?.type;

  @PolymorpheusInput()
  @Input({ required: true })
  searchQuery: string = this.context?.data?.searchQuery;

  @PolymorpheusInput()
  @Input({ required: true })
  isDisabled: boolean = this.context?.data?.isDisabled || false;

  @PolymorpheusInput()
  @Input({ required: true })
  hintText: string = this.context?.data?.hintText;

  @PolymorpheusInput()
  @Input({ required: true })
  totalBlockchains: number = this.context?.data?.totalBlockchains;

  @PolymorpheusInput()
  @Input({ required: true })
  blockchainsToShow$: Observable<AvailableBlockchain[]> = this.context?.data?.blockchainsToShow;

  @Output() handleSearchQuery = new EventEmitter<string>();

  @Output() handleSelection = new EventEmitter<AssetListType>();

  public readonly isMobile = this.headerStore.isMobile;

  public readonly allChainsSelectorItem = allChainsSelectorItem;

  public blockchainsToShow: AvailableBlockchain[] = [];

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      {
        type: 'from' | 'to';
        searchQuery: string;
        isDisabled?: boolean;
        hintText: string;
        totalBlockchains: number;
        // eslint-disable-next-line rxjs/finnish
        blockchainsToShow: Observable<AvailableBlockchain[]>;
        handleSearchQuery?: (query: string) => void;
        handleSelection?: (selection: AssetListType) => void;
      }
    >,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.context.data?.blockchainsToShow.subscribe(el => {
      this.blockchainsToShow = el;
      console.log(this.blockchainsToShow);
      this.cdr.detectChanges();
    });
  }

  public onItemClick(blockchainName: BlockchainName | null): void {
    if (blockchainName === null) {
      this.handleSelection.emit('allChains');
      this.context?.data?.handleSelection?.('allChains');
    } else {
      this.handleSelection.emit(blockchainName);
      this.context?.data?.handleSelection?.(blockchainName);
    }

    this.mobileNativeService.forceClose();
  }

  public getBlockchainTag(blockchain: AvailableBlockchain): string {
    return SelectorUtils.getBlockchainTag(blockchain);
  }

  public handleSearchQueryFn(query: string): void {
    this.handleSearchQuery.emit(query);
    this.context?.data?.handleSearchQuery?.(query);
  }
}
