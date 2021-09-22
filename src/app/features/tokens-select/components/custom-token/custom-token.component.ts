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
import { TranslateService } from '@ngx-translate/core';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { CustomTokenWarningModalComponent } from '../custom-token-warning-modal/custom-token-warning-modal.component';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenComponent {
  /**
   * Should hints be shown.
   */
  public hintsShown: boolean;

  /**
   * Selected custom token.
   */
  @Input() public token: AvailableTokenAmount;

  /**
   * Custom token selection event.
   */
  @Output() public tokenSelected = new EventEmitter<AvailableTokenAmount>();

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private translateService: TranslateService,
    private readonly tokensService: TokensService
  ) {}

  /**
   * @description Open accept import modal and add token to local token collection in case of accept.
   */
  public handleImportClick(): void {
    this.dialogService
      .open(new PolymorpheusComponent(CustomTokenWarningModalComponent, this.injector), {
        data: { token: this.token },
        dismissible: true,
        label: this.translateService.instant('modals.confirmImportModal.title'),
        size: 's'
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          const favoriteToken = { ...this.token, favorite: true };
          this.tokensService.addFavoriteToken(favoriteToken);
          this.tokenSelected.emit(favoriteToken);
        }
      });
  }
}
