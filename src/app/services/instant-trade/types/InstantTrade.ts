import {InstantTradeToken} from './index';

interface InstantTrade {
    from: {
        token: InstantTradeToken;
        amount: BigInteger;
    }
    to: {
        token: InstantTradeToken;
        amount: BigInteger;
    }
    gasFee: BigInteger;
}

export default InstantTrade;
