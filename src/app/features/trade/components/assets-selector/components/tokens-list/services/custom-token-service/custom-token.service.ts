import { Inject, Injectable, Injector } from '@angular/core';
import { switchMap } from 'rxjs';
import { BlockchainsInfo, Token } from '@cryptorubic/core';
import { TranslateService } from '@ngx-translate/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { AuthService } from '@core/services/auth/auth.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { CustomTokenWarningModalComponent } from '@features/trade/components/assets-selector/components/tokens-list/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

@Injectable()
export class CustomTokenService {
  constructor(
    private readonly dialogService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly authService: AuthService
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
              if (
                this.authService.userAddress &&
                this.authService.userChainType ===
                  BlockchainsInfo.getChainType(customToken.blockchain)
              ) {
                const tokenBalance = await this.sdkLegacyService.adaptersFactoryService
                  .getAdapter(customToken.blockchain as RubicAny)
                  .getBalance(this.authService.userAddress, customToken.address);
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
