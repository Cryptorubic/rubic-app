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
import { blockchainsList } from 'src/app/features/swaps/constants/BlockchainsList';
import { BlockchainItem } from 'src/app/features/swaps/models/BlockchainItem';

@Component({
  selector: 'app-rubic-blockchains',
  templateUrl: './rubic-blockchains.component.html',
  styleUrls: ['./rubic-blockchains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicBlockchainsComponent implements OnInit {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  @Input() public blockchainType: 'from' | 'to';

  public selectedBlockchain: BlockchainItem;

  public blockchainsList = blockchainsList;

  public visibleBlockchainsList: BlockchainItem[];

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.selectedBlockchain = this.findBlockchainBySymbol(BLOCKCHAIN_NAME.ETHEREUM);
    this.visibleBlockchainsList = this.blockchainsList.filter(
      blockchain => blockchain.symbol !== this.selectedBlockchain.symbol
    );

    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(form => {
      const blockchainSymbol =
        this.blockchainType === 'from' ? form.fromBlockchain : form.toBlockchain;
      this.selectedBlockchain = this.findBlockchainBySymbol(blockchainSymbol);
      this.visibleBlockchainsList = this.blockchainsList.filter(
        blockchain => blockchain.symbol !== this.selectedBlockchain.symbol
      );
      this.cdr.markForCheck();
    });
  }

  private findBlockchainBySymbol(symbol: string): BlockchainItem {
    return this.blockchainsList.find(blockchain => blockchain.symbol === symbol);
  }

  public selectBlockchain(blockchainSymbol: string) {
    if (this.selectedBlockchain.symbol !== blockchainSymbol) {
      this.selectedBlockchain = this.findBlockchainBySymbol(blockchainSymbol);

      const blockchainControlName =
        this.blockchainType === 'from' ? 'fromBlockchain' : 'toBlockchain';
      this.swapFormService.commonTrade.controls.input.patchValue({
        [blockchainControlName]: blockchainSymbol
      });

      const tokenControlName = this.blockchainType === 'from' ? 'fromToken' : 'toToken';
      this.swapFormService.commonTrade.controls.input.patchValue({
        [tokenControlName]: null
      });
    }
  }
}
