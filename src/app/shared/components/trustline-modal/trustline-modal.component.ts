import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TrustlineComponentOptions } from '@app/features/trade/components/trustline/models/trustline-component-options';

@Component({
  selector: 'app-trustline-modal',
  templateUrl: './trustline-modal.component.html',
  styleUrls: ['./trustline-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustlineModalComponent {
  public readonly options: TrustlineComponentOptions;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, TrustlineComponentOptions>
  ) {
    this.options = context.data;
  }

  public onConfirm(): void {
    this.context.completeWith(null);
  }
}
