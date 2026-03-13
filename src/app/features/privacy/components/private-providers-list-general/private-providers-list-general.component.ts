import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { PrivateTradeType } from '../../constants/private-trade-types';
import { TuiScrollbarComponent } from '@taiga-ui/core';
import { PrivateProviderInfoUI } from '../../models/provider-info';
import { ModalService } from '@app/core/modals/services/modal.service';

@Component({
  selector: 'app-private-providers-list-general',
  templateUrl: './private-providers-list-general.component.html',
  styleUrls: ['./private-providers-list-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateProvidersListGeneralComponent {
  @Input({ required: true }) states: PrivateProviderInfoUI[] = [];

  @Input({ required: true }) selectedTradeType: PrivateTradeType;

  @Output() readonly selectTrade = new EventEmitter<PrivateTradeType>();

  @ViewChild('tuiScrollBar') scrollBarElement: TuiScrollbarComponent;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly headerStore: HeaderStore,
    @Inject(Injector) private readonly injector: Injector,
    private readonly modalService: ModalService
  ) {}

  public handleTradeSelection(tradeType: PrivateTradeType): void {
    this.selectTrade.emit(tradeType);
  }

  public openOtherProvidersList(): void {
    this.modalService
      .openOtherPrivateProvidersList(this.states, this.selectedTradeType, true, this.injector)
      .subscribe(tradeType => {
        if (tradeType) {
          this.handleTradeSelection(tradeType);
        }
      });
  }
}
