/* eslint-disable rxjs/no-async-subscribe */
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
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { Web3PublicSupportedBlockchain, Web3Pure } from 'rubic-sdk';
import { Injector as RubicInjector } from 'rubic-sdk';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { CustomTokenWarningModalComponent } from '../custom-token-warning-modal/custom-token-warning-modal.component';
import { switchMap } from 'rxjs';

// @TODO TEST INT 2
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
    private readonly cdr: ChangeDetectorRef,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  /**
   * Opens 'accept import' modal and adds token to local token collection in case of acceptation.
   */
  public onImportClick(): void {
    this.dialogService
      .open<boolean>(new PolymorpheusComponent(CustomTokenWarningModalComponent, this.injector), {
        data: { token: this.token },
        dismissible: true,
        label: this.translateService.instant('modals.confirmImportModal.title'),
        size: 's'
      })
      .pipe(
        switchMap(async confirm => {
          if (confirm) {
            if (this.walletConnectorService.address) {
              const tokenBalance = await RubicInjector.web3PublicService
                .getWeb3Public(this.token.blockchain as Web3PublicSupportedBlockchain)
                .getTokenBalance(this.walletConnectorService.address, this.token.address);
              return {
                ...this.token,
                amount: Web3Pure.fromWei(tokenBalance, this.token.decimals)
              };
            }

            return this.token;
          }
        })
      )
      .subscribe(token => {
        if (token) {
          this.tokenSelected.emit(token);
        }
      });
  }
}
