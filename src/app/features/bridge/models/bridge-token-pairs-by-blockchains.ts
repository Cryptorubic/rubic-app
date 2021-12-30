import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { List } from 'immutable';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';

export interface BridgeTokenPairsByBlockchains {
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  tokenPairs: List<BridgeTokenPair>;
}
