import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { List } from 'immutable';
import { BridgeToken } from './BridgeToken';

export interface BlockchainsBridgeTokens {
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  bridgeTokens: List<BridgeToken>;
}
