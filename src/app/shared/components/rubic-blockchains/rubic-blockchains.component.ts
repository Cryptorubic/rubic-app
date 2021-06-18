import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';

@Component({
  selector: 'app-rubic-blockchains',
  templateUrl: './rubic-blockchains.component.html',
  styleUrls: ['./rubic-blockchains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicBlockchainsComponent implements OnInit {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  @Input() public blockchainType: 'from' | 'to';

  public selectedBlockchain: BLOCKCHAIN_NAME;

  @Input() blockchainsList: Array<any>;

  public visibleBlockchainsList: Array<any>;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.selectedBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
    this.visibleBlockchainsList = this.blockchainsList.filter(
      blockchain => blockchain.symbol !== this.selectedBlockchain
    );

    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(form => {
      this.selectedBlockchain =
        this.blockchainType === 'from' ? form.fromBlockchain : form.toBlockchain;
      this.visibleBlockchainsList = this.blockchainsList.filter(
        blockchain => blockchain.symbol !== this.selectedBlockchain
      );
      this.cdr.markForCheck();
    });
  }

  public selectBlockchain(blockchainSymbol: number) {
    const blockchainControlName =
      this.blockchainType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    const blockchainControlValue = this.blockchainsList.find(
      blockchain => blockchain.symbol === blockchainSymbol
    );
    if (this.selectedBlockchain !== blockchainControlValue.symbol) {
      this.selectedBlockchain = blockchainControlValue.symbol;
      this.swapFormService.commonTrade.controls.input.patchValue({
        [blockchainControlName]: this.selectedBlockchain
      });

      const tokenControlName = this.blockchainType === 'from' ? 'fromToken' : 'toToken';
      this.swapFormService.commonTrade.controls.input.patchValue({
        [tokenControlName]: null
      });
    }
  }

  public getChainIcon(): string | undefined {
    return this.blockchainsList.find(blockchain => blockchain.symbol === this.selectedBlockchain)
      .chainImg;
  }
}
