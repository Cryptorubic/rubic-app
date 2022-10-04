import { Blockchain } from '@app/shared/constants/blockchain/ui-blockchains';
import { Token } from '@app/shared/models/tokens/token';
import { CrossChainTradeType, TxStatus } from 'rubic-sdk';

export interface UiRecentTrade {
  fromBlockchain: Blockchain;
  toBlockchain: Blockchain;
  fromToken: Token;
  toToken: Token;
  timestamp: number;
  srcTxLink: string;
  srcTxHash: string;
  dstTxHash?: string | null;
  dstTxLink?: string | null;
  statusFrom?: TxStatus;
  statusTo?: TxStatus;
  crossChainProviderType: CrossChainTradeType;
}
