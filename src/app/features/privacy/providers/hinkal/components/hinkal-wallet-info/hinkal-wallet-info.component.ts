import { WA_NAVIGATOR } from '@ng-web-apis/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { HinkalInstanceService } from '../../services/hinkal-sdk/hinkal-instance.service';
import { getRecipientInfoFromUserKeys } from '@hinkal/common';
import { distinctUntilChanged, map, timer } from 'rxjs';

@Component({
  selector: 'app-hinkal-wallet-info',
  templateUrl: './hinkal-wallet-info.component.html',
  styleUrls: ['./hinkal-wallet-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HinkalWalletInfoComponent {
  public readonly walletPrivateReceiverInfo$ = this.hinkalInstanceService.currSignature$.pipe(
    distinctUntilChanged(),
    map(v => (v ? this.getRecipientInfo() : null))
  );

  public addressCopied = false;

  constructor(
    private readonly hinkalInstanceService: HinkalInstanceService,
    @Inject(WA_NAVIGATOR) private readonly navigator: Navigator,
    private readonly cdr: ChangeDetectorRef
  ) {}

  private getRecipientInfo(): string | null {
    try {
      return getRecipientInfoFromUserKeys(this.hinkalInstanceService.hinkalInstance.userKeys);
    } catch {
      return null;
    }
  }

  private showHint(): void {
    this.addressCopied = true;
    timer(1500).subscribe(() => {
      this.addressCopied = false;
      this.cdr.markForCheck();
    });
  }

  public copyToClipboard(address: string): void {
    this.showHint();
    this.navigator.clipboard.writeText(address);
  }
}
