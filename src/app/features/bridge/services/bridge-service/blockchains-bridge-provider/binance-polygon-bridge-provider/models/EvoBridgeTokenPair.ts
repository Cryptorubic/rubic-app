import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';

export interface EvoBridgeTokenPair extends BridgeTokenPair {
  evoInfo: {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: EvoToken;
    [BLOCKCHAIN_NAME.POLYGON]: EvoToken;
  };
}

interface EvoToken {
  fee: BigNumber;
  feeBase: BigNumber;
  index: number;
}
