import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrivacycashSignatureService } from '../../services/privacy-cash-signature.service';
import { map } from 'rxjs';
import { PRIVACYCASH_SUPPORTED_WALLETS } from '../../constants/wallets';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';

@Component({
  selector: 'app-privacycash-signature-window',
  templateUrl: './privacycash-signature-window.component.html',
  styleUrls: ['./privacycash-signature-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PrivacycashSignatureWindowComponent {
  public readonly authorized$ = this.privacycashSignatureService.signature$.pipe(
    map(signature => !!signature && signature.length > 0)
  );

  public readonly supportedWallets = PRIVACYCASH_SUPPORTED_WALLETS.filter(
    walletName => walletName !== WALLET_NAME.METAMASK
  );

  constructor(private readonly privacycashSignatureService: PrivacycashSignatureService) {}

  public async signMessage(): Promise<void> {
    this.privacycashSignatureService.makeSignature();
  }
}
