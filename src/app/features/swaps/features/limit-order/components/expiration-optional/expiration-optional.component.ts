import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  Inject,
  Injector
} from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import {
  ExpirationOption,
  expirationOptions
} from '@features/swaps/features/limit-order/constants/expiration-options';
import { OrderExpirationService } from '@features/swaps/features/limit-order/services/order-expiration.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-expiration-optional',
  templateUrl: './expiration-optional.component.html',
  styleUrls: ['./expiration-optional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpirationOptionalComponent {
  @Output() onClose = new EventEmitter<void>();

  public readonly options = expirationOptions;

  public readonly highlightedOption: number;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, void>,
    private readonly modalService: ModalService,
    private readonly orderExpirationService: OrderExpirationService,
    @Inject(Injector) private readonly injector: Injector
  ) {
    const expirationTime = this.orderExpirationService.expirationTime;
    const index = this.options.findIndex(option => option.minutes === expirationTime);
    this.highlightedOption = index !== -1 ? index : this.options.length;
  }

  public onOptionsClick(option: ExpirationOption): void {
    this.orderExpirationService.updateExpirationTime(option.minutes);
    this.onClose.emit();
    if (this.context) {
      this.context.completeWith();
    }
  }

  public onCustomClick(): void {
    // this.orderExpirationService.openExpirationCustomModal().subscribe();
    this.modalService.openExpirationalCustomModal(this.injector);
  }
}
