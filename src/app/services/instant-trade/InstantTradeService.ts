import {InstantTradeToken, InstantTrade} from './types';
import BigNumber from 'bignumber.js';

abstract class InstantTradeService {

    public abstract async getTrade(fromAmount: BigNumber, fromToken: InstantTradeToken, toToken): Promise<InstantTrade>

    public abstract getGasFee(fromAmount: BigNumber)

    public abstract getToAmount(fromAmount: BigNumber)

    public abstract async createTrade(trade: InstantTrade, onConfirm: Function): Promise<void>

}

export default InstantTradeService;
