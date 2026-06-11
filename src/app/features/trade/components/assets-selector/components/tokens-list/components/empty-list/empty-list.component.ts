import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  Output
} from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AssetListType } from '@features/trade/models/asset';
import { map } from 'rxjs';

@Component({
  selector: 'app-empty-list',
  templateUrl: './empty-list.component.html',
  styleUrls: ['./empty-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyListComponent {
  @Input({ required: true }) hasQuery: boolean;

  @Input({ required: true }) assetListType: AssetListType;

  @Output() listSwitch = new EventEmitter<void>();

  public readonly user$ = this.walletConnectorService.activeWallets$.pipe(
    map(activeWallets => activeWallets.length > 0)
  );

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public switchToDefaultList(): void {
    this.listSwitch.emit();
  }

  public openAuthModal(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }
}
