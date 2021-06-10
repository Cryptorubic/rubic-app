import { Component, EventEmitter, Input, Output } from '@angular/core';
import BigNumber from 'bignumber.js';
import { InstantTradeParameters } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-parametres';
import { InstantTradeSwapInput } from '../../../../models/instant-trade-input';
import { InstantTradeProviderController } from '../../../../models/instant-trades-provider-controller';
import { Token } from '../../../../../../../shared/models/tokens/Token';
import { BLOCKCHAIN_NAME } from '../../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-tokens-swap-input',
  templateUrl: './tokens-swap-input.component.html',
  styleUrls: ['./tokens-swap-input.component.scss']
})
export class TokensSwapInputComponent extends InstantTradeSwapInput {
  @Input() public tradeController: InstantTradeProviderController;

  @Input() public areAdvancedOptionsValid: boolean;

  @Output() public customTokenFormOpeningEvent: EventEmitter<boolean>;

  @Output() public updateCustomTokenEvent: EventEmitter<Token>;

  @Output() public setCustomTokenAddressEvent: EventEmitter<string>;

  @Output() public addCustomTokenEvent: EventEmitter<void>;

  @Output() public tradeParametersChange: EventEmitter<InstantTradeParameters>;

  get gasFeeDisplayCondition(): BigNumber | undefined {
    return (
      this.blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
      this.blockchain !== BLOCKCHAIN_NAME.POLYGON &&
      this.tradeController.trade?.gasFeeInEth &&
      this.tradeController.trade?.gasFeeInUsd
    );
  }

  constructor() {
    super();
    this.customTokenFormOpeningEvent = new EventEmitter<boolean>();
    this.updateCustomTokenEvent = new EventEmitter<Token>();
    this.setCustomTokenAddressEvent = new EventEmitter<string>();
    this.addCustomTokenEvent = new EventEmitter<void>();
    this.tradeParametersChange = new EventEmitter<InstantTradeParameters>();
  }

  public setIsCustomTokenFormOpened(isOpened: boolean): void {
    this.customTokenFormOpeningEvent.emit(isOpened);
  }

  public setCustomTokenAddress(address: string): void {
    this.setCustomTokenAddressEvent.emit(address);
  }

  public updateCustomToken(tokenBody: Token): void {
    this.updateCustomTokenEvent.emit(tokenBody);
  }

  public addCustomToken(): void {
    this.addCustomTokenEvent.emit();
  }

  get gasOptimizationChecked(): boolean {
    return this.tradeParameters.gasOptimizationChecked;
  }

  set gasOptimizationChecked(value) {
    this.tradeParameters = {
      ...this.tradeParameters,
      gasOptimizationChecked: value
    };
    this.tradeParametersChange.emit(this.tradeParameters);
  }
}
