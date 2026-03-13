import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { StoreService } from '@core/services/store/store.service';

@Component({
  selector: 'app-railgun-account-info',
  templateUrl: './railgun-account-info.component.html',
  styleUrls: ['./railgun-account-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailgunAccountInfoComponent {
  @Input({ required: true }) accountId: string;

  @Input({ required: true }) evmAddress: string;

  @Input({ required: true }) railgunAddress: string;

  @Output() handleLogout = new EventEmitter<void>();

  private readonly storeKey = 'RAILGUN_ENCRYPTION_CREDS_V1';

  private readonly storeService = inject(StoreService);

  public logout(): void {
    this.handleLogout.emit();
  }
}
