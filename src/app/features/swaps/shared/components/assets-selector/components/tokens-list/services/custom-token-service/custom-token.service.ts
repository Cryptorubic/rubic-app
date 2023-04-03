import { Inject, Injectable, Injector } from '@angular/core';
import { CustomTokenWarningModalComponent } from '@features/swaps/shared/components/assets-selector/components/tokens-list/components/custom-token-warning-modal/custom-token-warning-modal.component';
import { switchMap } from 'rxjs';
import { Injector as RubicInjector } from 'rubic-sdk/lib/core/injector/injector';
import { BlockchainsInfo, Web3PublicSupportedBlockchain, Web3Pure } from 'rubic-sdk';
import { TranslateService } from '@ngx-translate/core';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { AuthService } from '@core/services/auth/auth.service';
import { ModalService } from '@app/core/modals/services/modal.service';

@Injectable()
export class CustomTokenService {
  constructor(
    private readonly dialogService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly authService: AuthService,
    private readonly assetsSelectorService: AssetsSelectorService
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
                const tokenBalance = await RubicInjector.web3PublicService
                  .getWeb3Public(customToken.blockchain as Web3PublicSupportedBlockchain)
                  .getTokenBalance(this.authService.userAddress, customToken.address);
                return {
                  ...customToken,
                  amount: Web3Pure.fromWei(tokenBalance, customToken.decimals)
                };
              }
            } catch {}
            return customToken;
          }
        })
      )
      .subscribe(token => {
        if (token) {
          this.assetsSelectorService.onAssetSelect(token);
        }
      });
  }
}
