import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { List } from 'immutable';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';

export interface BridgeTokenPairsByBlockchains {
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  tokenPairs: List<BridgeTokenPair>;
}
