import { Injectable } from '@angular/core';
import { FormsTogglerService } from '../forms-toggler/forms-toggler.service';
import { pairwise } from 'rxjs';
import { MAIN_FORM_TYPE, MainFormType } from '../forms-toggler/models';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { SwapsFormService } from '../swaps-form/swaps-form.service';
import { AuthService } from '@app/core/services/auth/auth.service';

@Injectable()
export class GasFormAnalyticService {
  constructor(
    private readonly formsTogglerService: FormsTogglerService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapsFormService: SwapsFormService,
    private readonly authService: AuthService
  ) {
    this.subOnGasFormSelect();
  }

  private subOnGasFormSelect(): void {
    this.formsTogglerService.selectedForm$.pipe(pairwise()).subscribe(([prev, current]) => {
      if (prev === MAIN_FORM_TYPE.SWAP_FORM && current === MAIN_FORM_TYPE.GAS_FORM) {
        this.gtmService.fireGasFormGtm({ visitedFrom: 'fromSwapForm' });
      }
      if (this.isGasFormLeftAfterSelectionTargetAsset(prev)) {
        this.gtmService.fireGasFormGtm({
          leaveGasFormInfo: {
            walletAddress: this.authService.userAddress,
            toBlockchain: this.swapsFormService.inputValue.toBlockchain,
            toToken: this.swapsFormService.inputValue.toToken.name
          }
        });
      }
    });
  }

  private isGasFormLeftAfterSelectionTargetAsset(prevForm: MainFormType): boolean {
    return (
      prevForm === MAIN_FORM_TYPE.GAS_FORM &&
      !!this.swapsFormService.inputValue.toBlockchain &&
      !!this.swapsFormService.inputValue.toToken &&
      !Boolean(this.swapsFormService.inputValue.fromBlockchain)
    );
  }
}
