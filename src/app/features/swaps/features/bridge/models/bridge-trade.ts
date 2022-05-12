import BigNumber from 'bignumber.js';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { BridgeTokenPair } from '@features/swaps/features/bridge/models/bridge-token-pair';
import { BRIDGE_PROVIDER } from '@shared/models/bridge/bridge-provider';

export interface BridgeTrade {
  provider: BRIDGE_PROVIDER;
  token: BridgeTokenPair;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  amount: BigNumber;
  toAddress: string;
  onTransactionHash?: (hash: string, tradeObject?: BridgeTrade) => void;
}
