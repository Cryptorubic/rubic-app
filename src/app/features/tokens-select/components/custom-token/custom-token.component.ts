import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  Injector
} from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';
import { CustomTokenWarningModalComponent } from '../custom-token-warning-modal/custom-token-warning-modal.component';
import { AvailableTokenAmount } from '../../../../shared/models/tokens/AvailableTokenAmount';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenComponent {
  @Input() token: AvailableTokenAmount;

  @Output() tokenSelected = new EventEmitter<AvailableTokenAmount>();

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public onImportClick() {
    this.dialogService
      .open(new PolymorpheusComponent(CustomTokenWarningModalComponent, this.injector), {
        data: { token: this.token },
        dismissible: true,
        label: 'Confirm import',
        size: 's'
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.tokenSelected.emit(this.token);
        }
      });
  }
}
