import { BlockchainName } from '@app/shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@app/shared/models/instant-trade/instant-trade-provider';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { CrossChainProvider } from '../services/cross-chain-routing-service/models/cross-chain-trade';

export interface SwapSchemeModalData {
  srcProvider: INSTANT_TRADE_PROVIDER;
  dstProvider: INSTANT_TRADE_PROVIDER;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  crossChainProvider: CrossChainProvider;
  srcTxHash: string;
}
