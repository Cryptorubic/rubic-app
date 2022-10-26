import { BlockchainName } from 'rubic-sdk';
import { List } from 'immutable';
import { BridgeTokenPair } from '@features/swaps/features/bridge/models/bridge-token-pair';

export interface BridgeTokenPairsByBlockchains {
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  tokenPairs: List<BridgeTokenPair>;
}
