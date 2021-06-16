import { Component, Input, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';

@Component({
  selector: 'app-rubic-blockchains',
  templateUrl: './rubic-blockchains.component.html',
  styleUrls: ['./rubic-blockchains.component.scss']
})
export class RubicBlockchainsComponent {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  @Input() public blockchainType: 'from' | 'to';

  public selectedBlockchain: BLOCKCHAIN_NAME;

  @Input() blockchainsList: Array<any>;

  constructor(private readonly swapFormService: SwapFormService) {
    this.selectedBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(form => {
      this.selectedBlockchain =
        this.blockchainType === 'from' ? form.fromBlockchain : form.toBlockchain;
    });
  }

  public selectBlockchain(blockchainId: number) {
    const controlName = this.blockchainType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    const controlValue = this.blockchainsList.find(blockchain => blockchain.id === blockchainId);
    this.selectedBlockchain = controlValue.name;
    this.swapFormService.commonTrade.controls.input.patchValue({
      [controlName]: this.selectedBlockchain
    });
  }

  public getChainIcon(): string | undefined {
    const { fromBlockchain, toBlockchain } = this.swapFormService.commonTrade.controls.input.value;
    const blockchain = this.blockchainType === 'from' ? fromBlockchain : toBlockchain;
    return BlockchainsInfo.getBlockchainByName(blockchain)?.imagePath;
  }
}
