import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';

export interface BridgeTrade {
  provider: BRIDGE_PROVIDER;
  token: BridgeTokenPair;
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  amount: BigNumber;
  toAddress: string;
  onTransactionHash?: (hash: string) => void;
}
