import BigNumber from 'bignumber.js';
import { BlockchainName } from 'rubic-sdk';
import { BridgeTokenPair } from '@features/swaps/features/bridge/models/bridge-token-pair';
import { RUBIC_BRIDGE_PROVIDER } from '@features/swaps/shared/models/trade-provider/bridge-provider';

export interface BridgeTrade {
  provider: RUBIC_BRIDGE_PROVIDER;
  token: BridgeTokenPair;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  amount: BigNumber;
  toAddress: string;
  onTransactionHash?: (hash: string, tradeObject?: BridgeTrade) => void;
}
