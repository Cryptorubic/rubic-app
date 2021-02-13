import {InstantTradeToken} from './index';
import BigNumber from 'bignumber.js';

interface InstantTrade {
    from: {
        token: InstantTradeToken;
        amount: BigNumber;
    }
    to: {
        token: InstantTradeToken;
        amount: BigNumber;
    }
    estimatedGas: BigNumber;
    gasFee: BigNumber;
}

export default InstantTrade;
