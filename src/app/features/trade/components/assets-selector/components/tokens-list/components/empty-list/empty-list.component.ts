import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
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
    private readonly walletsModalService: WalletsModalService
  ) {}

  public switchToDefaultList(): void {
    this.listSwitch.emit();
  }

  public openAuthModal(): void {
    this.walletsModalService.open$();
  }
}
