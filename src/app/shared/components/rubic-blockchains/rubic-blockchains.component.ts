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
import { blockchainsList } from 'src/app/features/swaps/constants/BlockchainsList';
import { BlockchainItem } from 'src/app/features/swaps/models/BlockchainItem';
import { SwapForm } from 'src/app/features/swaps/models/SwapForm';
import { FormService } from 'src/app/shared/models/swaps/FormService';

@Component({
  selector: 'app-rubic-blockchains',
  templateUrl: './rubic-blockchains.component.html',
  styleUrls: ['./rubic-blockchains.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicBlockchainsComponent implements OnInit {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<any>>;

  @Input() public blockchainType: 'from' | 'to';

  @Input() formService: FormService;

  @Input() blockchainsList = blockchainsList;

  public selectedBlockchain: BlockchainItem;

  public visibleBlockchainsList: BlockchainItem[];

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setFormValues(this.swapFormService.commonTrade.controls.input.value);
    this.formService.commonTrade.controls.input.valueChanges.subscribe(form => {
      this.setFormValues(form);
    });
  }

  private setFormValues(form: SwapForm['input']): void {
    const blockchainSymbol =
      this.blockchainType === 'from' ? form.fromBlockchain : form.toBlockchain;
    this.selectedBlockchain = this.findBlockchainBySymbol(blockchainSymbol);
    this.visibleBlockchainsList = this.blockchainsList.filter(
      blockchain => blockchain.symbol !== this.selectedBlockchain.symbol
    );
    this.cdr.markForCheck();
  }

  private findBlockchainBySymbol(symbol: string): BlockchainItem {
    return this.blockchainsList.find(blockchain => blockchain.symbol === symbol);
  }

  public selectBlockchain(blockchainSymbol: string) {
    if (this.selectedBlockchain.symbol !== blockchainSymbol) {
      this.selectedBlockchain = this.findBlockchainBySymbol(blockchainSymbol);

      const blockchainControlName =
        this.blockchainType === 'from' ? 'fromBlockchain' : 'toBlockchain';
      const tokenControlName = this.blockchainType === 'from' ? 'fromToken' : 'toToken';
      this.formService.commonTrade.controls.input.patchValue({
        [blockchainControlName]: blockchainSymbol,
        [tokenControlName]: null
      });
    }
  }
}
