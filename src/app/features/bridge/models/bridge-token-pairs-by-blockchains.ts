import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { List } from 'immutable';
import { BridgeTokenPair } from '@features/bridge/models/bridge-token-pair';

export interface BridgeTokenPairsByBlockchains {
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  tokenPairs: List<BridgeTokenPair>;
}
