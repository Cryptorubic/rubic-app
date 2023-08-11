import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  Inject,
  Injector
} from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { ModalService } from '@app/core/modals/services/modal.service';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { INSTANT_TRADE_STATUS } from '../../../../models/instant-trades-trade-status';
import { ON_CHAIN_TRADE_TYPE } from 'rubic-sdk/lib/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

@Component({
  selector: 'app-providers-panels-container',
  templateUrl: './providers-panels-container.component.html',
  styleUrls: ['./providers-panels-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersPanelsContainerComponent {
  private _providersData: InstantTradeProviderData[];

  @Input() set providersData(providersData: InstantTradeProviderData[]) {
    this._providersData = providersData
      .filter(provider => provider.name !== ON_CHAIN_TRADE_TYPE.WRAPPED)
      .map((data, index) => ({
        ...data,
        fullSize: index === providersData.length - 1 && (providersData.length - 1) % 2 !== 0
      }));

    if (this.providersData?.[0]?.trade && this.selectedProvider) {
      this.isBestProvider = this.providersData[0].trade.type === this.selectedProvider.name;
    }
  }

  public get providersData(): InstantTradeProviderData[] {
    return this._providersData;
  }

  @Output() public onSelectProvider = new EventEmitter<InstantTradeProviderData>();

  public showAllProviders = false;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public get selectedProvider(): InstantTradeProviderData {
    return this.providersData.find(provider => provider.isSelected) || this.providersData[0];
  }

  public get isSearchingForProvider(): boolean {
    return this.selectedProvider.tradeStatus === INSTANT_TRADE_STATUS.CALCULATION;
  }

  public isBestProvider = false;

  constructor(
    private headerStore: HeaderStore,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public trackByFn(_index: number, item: InstantTradeProviderData): string {
    return item.name + item.tradeStatus + item.isSelected + item.trade?.to.tokenAmount;
  }

  public openProvidersList(): void {
    this.modalService
      .openProvidersModal(this.providersData, this.injector)
      .subscribe(selectedProvider => {
        if (selectedProvider) {
          this.onSelectProvider.emit(selectedProvider);
        }
      });
  }
}
