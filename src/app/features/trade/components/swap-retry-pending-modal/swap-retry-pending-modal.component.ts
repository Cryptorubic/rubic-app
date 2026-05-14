import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import { SwapRetryModalInput } from './models/swap-retry-modal-input';
import { ProviderData } from './models/provider-data';
import { CrossChainTradeType, OnChainTradeType } from '@cryptorubic/core';
import { ON_CHAIN_PROVIDERS } from '../../constants/on-chain-providers';
import { RubicStep } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { BRIDGE_PROVIDERS } from '../../constants/bridge-providers';

@Component({
  selector: 'app-swap-retry-pending-modal',
  templateUrl: './swap-retry-pending-modal.component.html',
  styleUrls: ['./swap-retry-pending-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapRetryPendingModalComponent implements OnDestroy {
  public readonly swapRetryModalInput$: Observable<SwapRetryModalInput>;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { swapRetryModalInput$: Observable<SwapRetryModalInput> }
    >,
    private readonly modalService: ModalService,
    private readonly el: ElementRef<HTMLElement>,
    private readonly previewSwapService: PreviewSwapService
  ) {
    this.swapRetryModalInput$ = this.context.data.swapRetryModalInput$;

    this.modalService.setModalEl({ elRef: el, context: context });
  }

  public ngOnDestroy(): void {
    this.modalService.setModalEl({ elRef: null, context: null });
  }

  public onSwap(allowedToContinue: boolean = true): void {
    this.previewSwapService.continueBackupSwap(allowedToContinue);
  }

  public getProviderData(routes: RubicStep[]): ProviderData {
    if (routes && routes.length > 0) {
      const route = routes[0];

      const provider =
        route.type === 'on-chain'
          ? ON_CHAIN_PROVIDERS[route.provider as OnChainTradeType]
          : BRIDGE_PROVIDERS[route.provider as CrossChainTradeType];

      return provider || this.getUnknownProvider();
    }

    return this.getUnknownProvider();
  }

  private getUnknownProvider(): ProviderData {
    return {
      name: 'Unknown',
      color: 'white',
      image: 'assets/images/icons/unknown.svg'
    };
  }
}
