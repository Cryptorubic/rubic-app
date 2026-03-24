import { ChangeDetectionStrategy, Component, Injector, Input, inject } from '@angular/core';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { receiverAnimation } from '@app/features/privacy/providers/shared-privacy-providers/animations/receiver-animation';
import { PrivateSwapFormConfig } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-form-types';
import { PrivateModalsService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { PrivacyMainPageService } from '../../services/privacy-main-page.service';
import { PrivacyFormValue } from '../../services/models/privacy-form';
import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';
import { PRIVATE_MODE_TAB } from '../../constants/private-mode-tab';

@Component({
  selector: 'app-private-page-swap',
  templateUrl: './private-page-swap.component.html',
  styleUrls: ['./private-page-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [receiverAnimation()]
})
export class PrivatePageSwapComponent {
  @Input() creationConfig: PrivateSwapFormConfig = {
    withActionButton: true,
    withDstSelector: true,
    withDstAmount: true,
    withReceiver: true,
    withSrcAmount: true
  };

  @Input() set clearOutput(value: object) {
    this.patchSwapInfo({
      toAsset: null
    });
  }

  private readonly modalService = inject(PrivateModalsService);

  private readonly injector = inject(Injector);

  public readonly swapInfo$ = this.privacyMainPageService.swapInfo$;

  public showAllProviders = false;

  public get formValue(): PrivacyFormValue {
    return this.privacyMainPageService.formValue;
  }

  public get hasOutputContainer(): boolean {
    return this.creationConfig.withDstSelector;
  }

  constructor(private readonly privacyMainPageService: PrivacyMainPageService) {}

  private patchSwapInfo(partialSwapInfo: Partial<PrivateSwapInfo>): void {
    this.privacyMainPageService.patchFormValue(partialSwapInfo);
  }

  public openInputSelector(): void {
    this.modalService
      .openPrivateTokensModal(this.injector, 'from', this.creationConfig.assetsSelectorConfig)
      .subscribe((selectedToken: BalanceToken) => {
        this.patchSwapInfo({ fromAsset: selectedToken });
      });
  }

  public openOutputSelector(): void {
    const isOnChain = this.privacyMainPageService.selectedTab === PRIVATE_MODE_TAB.ON_CHAIN;
    const fromChain = this.privacyMainPageService.swapInfo.fromAsset?.blockchain;
    const config: AssetsSelectorConfig = {
      ...this.creationConfig.assetsSelectorConfig,
      ...(isOnChain &&
        fromChain && {
          showAllChains: false,
          listType: fromChain
        })
    };
    this.modalService
      .openPrivateTokensModal(this.injector, 'to', config)
      .subscribe((selectedToken: BalanceToken) => {
        this.patchSwapInfo({ toAsset: selectedToken });
      });
  }

  public async revert(): Promise<void> {
    this.patchSwapInfo({
      fromAsset: this.formValue.toAsset,
      toAsset: this.formValue.fromAsset
    });
  }

  public switchShowAllProviders(value: boolean): void {
    this.privacyMainPageService.setShowAllProviders(value);
  }
}
