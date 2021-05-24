import { EventEmitter, Input, Output } from '@angular/core';
import { List } from 'immutable';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import BigNumber from 'bignumber.js';
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

  public readonly INSTANT_TRADES_STATUS = INSTANT_TRADES_STATUS;

  public get fromAmountAsNumber(): BigNumber {
    return new BigNumber(this.tradeParameters.fromAmount);
  }

  protected constructor() {
    this.tokenChangeEvent = new EventEmitter();
    this.createTradeEvent = new EventEmitter();
  }

  public shouldAnimateButton(providerIndex: number) {
    const tradeState = this.trades[providerIndex]?.tradeState;
    return (
      (tradeState &&
        tradeState !== INSTANT_TRADES_STATUS.ERROR &&
        tradeState !== INSTANT_TRADES_STATUS.COMPLETED) ||
      this.waitingForProvider
    );
  }

  public checkIfError(providerIndex: number): boolean {
    return this.trades[providerIndex]?.tradeState === INSTANT_TRADES_STATUS.ERROR;
  }

  public getToAmount(providerIndex: number): string {
    const to = this.trades[providerIndex]?.trade?.to;
    return to ? to.amount.toFixed(to.token.decimals) : '';
  }

  public tokenChange(token: InputToken): void {
    this.tokenChangeEvent.emit(token);
  }

  public createTrade(index: number) {
    this.createTradeEvent.emit(index);
  }
}
