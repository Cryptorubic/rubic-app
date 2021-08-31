import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';

export interface BridgeTrade {
  token: BridgeTokenPair;
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  amount: BigNumber;
  toAddress: string;
  onTransactionHash?: (hash: string) => void;
}
