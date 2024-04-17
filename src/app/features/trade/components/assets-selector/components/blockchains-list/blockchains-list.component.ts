import { ChangeDetectionStrategy, Component, Inject, OnDestroy, Optional } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { Observable, combineLatestWith, map, of } from 'rxjs';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { MAIN_FORM_TYPE } from '@app/features/trade/services/forms-toggler/models';
import { GasFormService } from '@app/features/trade/services/gas-form/gas-form.service';
import { switchIif } from '@app/shared/utils/utils';
import { FormType } from '@app/features/trade/models/form-type';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-blockchains-list',
  templateUrl: './blockchains-list.component.html',
  styleUrls: ['./blockchains-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsListComponent implements OnDestroy {
  public readonly blockchainsToShow$ = this.blockchainsListService.blockchainsToShow$.pipe(
    combineLatestWith(
      this.gasFormService.sourceBlockchainsToShow$,
      this.gasFormService.targetBlockchainsToShow$
    ),
    switchIif(
      () => this.formsTogglerService.isGasFormOpened(),
      () => this.gasFormBlockchainsToShow$,
      ([swapFormBlockchainsToShow]) => of(swapFormBlockchainsToShow)
    ),
    map(blockchains => [
      ...blockchains.slice(0, 8),
      ...blockchains.slice(8, blockchains.length).sort((a, b) => a.name.localeCompare(b.name))
    ])
  );

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { formType: FormType }>,
    private readonly blockchainsListService: BlockchainsListService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly mobileNativeService: MobileNativeModalService,
    public readonly formsTogglerService: FormsTogglerService,
    private readonly gasFormService: GasFormService
  ) {}

  public get formType(): FormType {
    return this.context?.data?.formType || this.assetsSelectorService.formType;
  }

  ngOnDestroy(): void {
    this.assetsSelectorService.setSelectorListTypeByAssetType();
  }

  private isTargetSelectorGasFormOpened(): boolean {
    return (
      this.formsTogglerService.selectedForm === MAIN_FORM_TYPE.GAS_FORM && this.formType === 'to'
    );
  }

  private get gasFormBlockchainsToShow$(): Observable<AvailableBlockchain[]> {
    return this.formType === 'to'
      ? this.gasFormService.targetBlockchainsToShow$
      : this.gasFormService.sourceBlockchainsToShow$;
  }

  public isDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public closeBlockchainsList(): void {
    this.assetsSelectorService.setSelectorListTypeByAssetType();
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    if (this.isTargetSelectorGasFormOpened()) {
      this.assetsSelectorService.onTargetBlockchainsSelectGasForm(
        blockchainName,
        this.blockchainsListService.availableBlockchains
      );
    } else {
      this.assetsSelectorService.onBlockchainSelect(blockchainName);
    }
    this.mobileNativeService.forceClose();
  }

  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;
}
