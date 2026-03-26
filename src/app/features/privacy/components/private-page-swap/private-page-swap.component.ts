import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  Self,
  inject
} from '@angular/core';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { receiverAnimation } from '@app/features/privacy/providers/shared-privacy-providers/animations/receiver-animation';
import { PrivateSwapFormConfig } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-form-types';
import { PrivateModalsService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';
import { PrivacyMainPageService } from '../../services/privacy-main-page.service';
import { PrivacyFormValue } from '../../services/models/privacy-form';
import { AssetsSelectorConfig } from '@app/features/trade/components/assets-selector/models/assets-selector-layout';
import { PRIVATE_MODE_TAB } from '../../constants/private-mode-tab';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivacyMainPageFromPrivateAssetsService } from '../../services/privacy-main-page-from-private-assets.service';
import { PrivacyMainPageTokensFacadeService } from '../../services/privacy-main-page-tokens-facade.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { PrivacyMainPageToPrivateAssetsService } from '../../services/privacy-main-page-to-private-assets.service';

@Component({
  selector: 'app-private-main-page-swap',
  templateUrl: './private-page-swap.component.html',
  styleUrls: ['./private-page-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: PrivacyMainPageFromPrivateAssetsService },
    { provide: ToAssetsService, useClass: PrivacyMainPageToPrivateAssetsService },
    { provide: TokensFacadeService, useClass: PrivacyMainPageTokensFacadeService }
  ],
  animations: [receiverAnimation()]
})
export class PrivatePageSwapComponent implements OnInit {
  @Input() creationConfig: PrivateSwapFormConfig = {
    withActionButton: true,
    withDstSelector: true,
    withDstAmount: true,
    withReceiver: true,
    withSrcAmount: true
  };

  @Input() set clearOutput(needClear: boolean) {
    if (needClear) {
      this.patchSwapInfo({
        toAsset: null
      });
    }
  }

  @Output() formChanged = new EventEmitter<PrivacyFormValue>();

  private readonly modalService = inject(PrivateModalsService);

  private readonly injector = inject(Injector);

  public readonly swapInfo$ = this.privacyMainPageService.swapInfo$;

  public readonly selectedTab$ = this.privacyMainPageService.selectedTab$;

  public readonly showAllProviders$ = this.privacyMainPageService.showAllProviders$;

  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public get swapInfo(): PrivacyFormValue {
    return this.privacyMainPageService.formValue;
  }

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privacyMainPageService: PrivacyMainPageService
  ) {}

  ngOnInit(): void {
    this.subscribeOnFormInputChanged();
  }

  private subscribeOnFormInputChanged(): void {
    this.swapInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(swapInfo => this.formChanged.emit(swapInfo));
  }

  public get formValue(): PrivacyFormValue {
    return this.privacyMainPageService.formValue;
  }

  public get hasOutputContainer(): boolean {
    return this.creationConfig.withDstSelector;
  }

  private patchSwapInfo(partialSwapInfo: Partial<PrivacyFormValue>): void {
    this.privacyMainPageService.patchFormValue(partialSwapInfo);
  }

  public openInputSelector(): void {
    const fromChain = this.privacyMainPageService.swapInfo.fromAsset?.blockchain;
    const config: AssetsSelectorConfig = {
      ...this.creationConfig.assetsSelectorConfig,
      ...(fromChain && {
        listType: fromChain
      })
    };
    this.modalService
      .openPrivateTokensModal(this.injector, 'from', config)
      .subscribe((selectedToken: BalanceToken) => {
        if (this.privacyMainPageService.selectedTab === PRIVATE_MODE_TAB.TRANSFER) {
          this.patchSwapInfo({ fromAsset: selectedToken, toAsset: selectedToken });
        } else {
          this.patchSwapInfo({ fromAsset: selectedToken });
        }
      });
  }

  public openOutputSelector(): void {
    const isOnChain = this.privacyMainPageService.selectedTab === PRIVATE_MODE_TAB.ON_CHAIN;
    const fromChain = this.privacyMainPageService.swapInfo.fromAsset?.blockchain;
    const config: AssetsSelectorConfig = {
      ...this.creationConfig.assetsSelectorConfig,
      ...(isOnChain &&
        fromChain && {
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
      fromAsset: this.swapInfo.toAsset,
      toAsset: this.swapInfo.fromAsset
    });
  }

  public switchShowAllProviders(value: boolean): void {
    this.privacyMainPageService.setShowAllProviders(value);
  }
}
