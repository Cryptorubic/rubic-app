import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { Web3PublicSupportedBlockchain, Web3Pure } from 'rubic-sdk';
import { Injector as RubicInjector } from 'rubic-sdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { CustomTokenWarningModalComponent } from 'src/app/features/swaps/shared/components/tokens-select/components/tokens-list/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { switchMap } from 'rxjs';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { TokensListService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list.service';

@Component({
  selector: 'app-custom-token',
  templateUrl: './custom-token.component.html',
  styleUrls: ['./custom-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenComponent {
  public hintShown: boolean;

  public readonly token = this.tokensListService.customToken;

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly tokensListService: TokensListService
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
          this.tokensSelectorService.onTokenSelect(token);
        }
      });
  }
}
