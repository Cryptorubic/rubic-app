import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { CrossChainTradeType, MaxAmountError, MinAmountError } from 'rubic-sdk';
import { fadeAnimation, listAnimation } from '@shared/utils/utils';
import { CrossChainTaggedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';

@Component({
  selector: 'app-trades-list',
  templateUrl: './trades-list.component.html',
  styleUrls: ['./trades-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation, listAnimation]
})
export class TradesListComponent {
  @Input() taggedTrades: CrossChainTaggedTrade[];

  @Output() public readonly selectionHandler = new EventEmitter<void>();

  public readonly selectedTrade$ = this.crossChainFormService.selectedTrade$;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainFormService: CrossChainFormService
  ) {}

  public getMinMaxError(taggedTrade: CrossChainTaggedTrade): string {
    const error = taggedTrade.error;
    const isUsd =
      (error instanceof MinAmountError || error instanceof MinAmountError) &&
      error.tokenSymbol.toLowerCase().includes('usd');

    if (error instanceof MaxAmountError) {
      return `Max: ${error.maxAmount.toFixed(2)}${isUsd ? '$' : ''}`;
    }
    if (error instanceof MinAmountError) {
      return `Min: ${error.minAmount.toFixed(2)}${isUsd ? '$' : ''}`;
    }
  }

  public selectTrade(taggedTrade: CrossChainTaggedTrade): void {
    this.crossChainFormService.updateSelectedTrade(taggedTrade, true);
    this.selectionHandler.emit();
  }

  public trackByType(_index: number, taggedTrade: CrossChainTaggedTrade): CrossChainTradeType {
    return taggedTrade.tradeType;
  }
}
