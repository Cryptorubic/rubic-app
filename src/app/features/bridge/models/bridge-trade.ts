import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';
import { BridgeProvider } from '@shared/models/bridge/bridge-provider';

export interface BridgeTrade {
  provider: BridgeProvider;
  token: BridgeTokenPair;
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  amount: BigNumber;
  toAddress: string;
  onTransactionHash?: (hash: string) => void;
}
