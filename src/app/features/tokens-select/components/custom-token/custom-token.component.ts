import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  Injector,
  ChangeDetectorRef
} from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';
import { CustomTokenWarningModalComponent } from '../custom-token-warning-modal/custom-token-warning-modal.component';
import { AvailableTokenAmount } from '../../../../shared/models/tokens/AvailableTokenAmount';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenComponent {
  public hintsShown: boolean;

  @Input() token: AvailableTokenAmount;

  @Output() tokenSelected = new EventEmitter<AvailableTokenAmount>();

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private translateService: TranslateService
  ) {}

  public onImportClick() {
    this.dialogService
      .open(new PolymorpheusComponent(CustomTokenWarningModalComponent, this.injector), {
        data: { token: this.token },
        dismissible: true,
        label: this.translateService.instant('modals.confirmImportModal.title'),
        size: 's'
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.tokenSelected.emit(this.token);
        }
      });
  }

  public toggleHint(enable: boolean) {
    this.hintsShown = enable;
  }
}
