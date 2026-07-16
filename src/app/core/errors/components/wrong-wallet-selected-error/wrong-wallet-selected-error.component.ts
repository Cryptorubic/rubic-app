import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

@Component({
  standalone: false,
  selector: 'app-wrong-wallet-selected-error',
  templateUrl: './wrong-wallet-selected-error.component.html',
  styleUrls: ['./wrong-wallet-selected-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WrongWalletSelectedErrorComponent {
  public readonly walletAddress: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { walletAddress: string }>
  ) {
    this.walletAddress = context.data.walletAddress;
  }
}
