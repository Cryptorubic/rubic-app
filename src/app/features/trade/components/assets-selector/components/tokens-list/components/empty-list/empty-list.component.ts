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
import { AuthService } from '@core/services/auth/auth.service';
import { AssetListType } from '@features/trade/models/asset';

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

  public readonly user$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService,
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
