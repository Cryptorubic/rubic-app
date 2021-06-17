import { Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-network-error',
  templateUrl: './network-error.component.html',
  styleUrls: ['./network-error.component.scss']
})
export class NetworkErrorComponent {
  public networkToChoose: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { networkToChoose: string }>
  ) {
    this.networkToChoose = context.data.networkToChoose;
  }
}
