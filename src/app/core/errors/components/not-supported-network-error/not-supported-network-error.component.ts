import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-not-supported-network-error',
  templateUrl: './not-supported-network-error.component.html',
  styleUrls: ['./not-supported-network-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotSupportedNetworkErrorComponent {
  public networkToChoose: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { networkToChoose: string }>
  ) {
    this.networkToChoose = context.data.networkToChoose;
  }
}
