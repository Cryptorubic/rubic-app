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
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { CustomTokenWarningModalComponent } from '../custom-token-warning-modal/custom-token-warning-modal.component';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenComponent {
  /**
   * Parsed custom token.
   */
  @Input() public token: AvailableTokenAmount;

  /**
   * Events event when custom token is selected.
   */
  @Output() public tokenSelected = new EventEmitter<AvailableTokenAmount>();

  /**
   * Should hint be shown.
   */
  public hintShown: boolean;

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  /**
   * Opens 'accept import' modal and adds token to local token collection in case of acceptation.
   */
  public onImportClick(): void {
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

  public toggleFavorite(): void {
    this.token.favorite = !this.token.favorite;
    this.cdr.markForCheck();
  }
}
