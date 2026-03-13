import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrivacycashSignatureService } from '../../services/privacy-cash-signature.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-privacycash-signature-window',
  templateUrl: './privacycash-signature-window.component.html',
  styleUrls: ['./privacycash-signature-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacycashSignatureWindowComponent {
  public readonly authorized$ = this.privacycashSignatureService.signature$.pipe(
    map(signature => !!signature && signature.length > 0)
  );

  constructor(private readonly privacycashSignatureService: PrivacycashSignatureService) {}

  public async signMessage(): Promise<void> {
    this.privacycashSignatureService.makeSignature();
  }
}
