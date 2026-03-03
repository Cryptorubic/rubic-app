import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { PrivacycashSignatureService } from '../../services/privacy-cash-signature.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-privacycash-signature-modal',
  templateUrl: './privacycash-signature-modal.component.html',
  styleUrls: ['./privacycash-signature-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacycashSignatureModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, null>,
    private readonly privacycashSignatureService: PrivacycashSignatureService
  ) {}

  public async signMessage(): Promise<void> {
    try {
      await this.privacycashSignatureService.makeSignature();
      this.context.completeWith(true);
    } catch {
      this.context.completeWith(false);
    }
  }
}
