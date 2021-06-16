import { Component, Input, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';

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
  }

  public selectBlockchain(blockchainId: number) {
    const controlName = this.blockchainType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    const controlValue = this.blockchainsList.find(blockchain => blockchain.id === blockchainId);
    this.selectedBlockchain = controlValue.symbol;
    this.swapFormService.commonTrade.get(controlName).setValue(this.selectedBlockchain);
  }
}
