import { Inject, Injectable, Injector } from '@angular/core';
import { switchMap } from 'rxjs';
import { Token } from '@cryptorubic/core';
import { TranslateService } from '@ngx-translate/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { ModalService } from '@app/core/modals/services/modal.service';
import { CustomTokenWarningModalComponent } from '@features/trade/components/assets-selector/components/tokens-list/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable()
export class CustomTokenService {
  constructor(
    private readonly dialogService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public openModal(customToken: AvailableTokenAmount): void {
    this.dialogService
      .showDialog<CustomTokenWarningModalComponent, boolean>(
        CustomTokenWarningModalComponent,
        {
          data: { token: customToken },
          dismissible: true,
          label: this.translateService.instant('modals.confirmImportModal.title'),
          size: 's',
          fitContent: true
        },
        this.injector
      )
      .pipe(
        switchMap(async confirm => {
          if (confirm) {
            try {
              const walletAddr = this.walletConnectorService.getActiveWalletAddress({
                blockchain: customToken.blockchain
              });
              if (walletAddr) {
                const tokenBalance = await this.sdkLegacyService.adaptersFactoryService
                  .getAdapter(customToken.blockchain as RubicAny)
                  .getBalance(walletAddr, customToken.address);
                return {
                  ...customToken,
                  amount: Token.fromWei(tokenBalance, customToken.decimals)
                };
              }
            } catch {}
            return customToken;
          }
        })
      )
      .subscribe(token => {
        if (token) {
          // @TODO TOKENS
          // this.assetsSelectorFacade.getAssetsService(this.type).selectCustomToken();
        }
      });
  }
}
