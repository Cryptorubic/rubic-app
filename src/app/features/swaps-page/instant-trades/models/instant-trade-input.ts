import { EventEmitter, Input, Output } from '@angular/core';
import { List } from 'immutable';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { InstantTradeProviderController } from './instant-trades-provider-controller';
import SwapToken from '../../../../shared/models/tokens/SwapToken';
import { InstantTradeParameters } from './instant-trades-parametres';
import { INSTANT_TRADES_STATUS } from './instant-trades-trade-status';
import InputToken from '../../../../shared/models/tokens/InputToken';

export abstract class InstantTradeSwapInput {
  @Input() public index: number;

  @Input() public trades: InstantTradeProviderController[];

  @Input() public toToken: SwapToken;

  @Input() public hasBestRate: boolean;

  @Input() public blockchain: BLOCKCHAIN_NAME;

  @Input() public availableToTokens: List<SwapToken>;

  @Input() public tradeParameters: InstantTradeParameters;

  @Input() public selectedTradeState: INSTANT_TRADES_STATUS;

  @Input() public waitingForProvider: boolean;

  @Output() public tokenChangeEvent: EventEmitter<InputToken>;

  @Output() public createTradeEvent: EventEmitter<number>;

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  protected constructor() {
    this.tokenChangeEvent = new EventEmitter();
    this.createTradeEvent = new EventEmitter();
  }
}
