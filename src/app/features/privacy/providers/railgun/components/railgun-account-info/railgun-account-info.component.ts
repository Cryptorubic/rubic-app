import { WA_NAVIGATOR } from '@ng-web-apis/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { StoreService } from '@core/services/store/store.service';
import { timer } from 'rxjs';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { fromPrivateToRubicChainMap } from '@features/privacy/providers/railgun/constants/network-map';

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

  public supportedChains = Object.values(fromPrivateToRubicChainMap).map(chain => {
    const icon = blockchainIcon[chain];
    const label = blockchainLabel[chain];

    return { icon, label };
  });

  public hintShown: boolean;

  private readonly navigator = inject(WA_NAVIGATOR);

  private readonly cdr = inject(ChangeDetectorRef);

  @Output() handleLogout = new EventEmitter<void>();

  private readonly storeKey = 'RAILGUN_ENCRYPTION_CREDS_V1';

  private readonly storeService = inject(StoreService);

  public logout(): void {
    this.handleLogout.emit();
  }

  public copyToClipboard(value: string): void {
    this.showHint();
    this.navigator.clipboard.writeText(value);
  }

  private showHint(): void {
    this.hintShown = true;
    timer(1500).subscribe(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    });
  }
}
