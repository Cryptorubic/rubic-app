import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { BlockchainName, CrossChainTradeType } from 'rubic-sdk';
import { Provider } from '@shared/constants/common/trades-providers';

export interface SwapSchemeModalData {
  srcProvider: Provider;
  dstProvider: Provider;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  crossChainProvider: CrossChainTradeType;
  srcTxHash: string;
  timestamp: number;
  bridgeType?: Provider;
  viaUuid?: string;
  rangoRequestId?: string;
}
