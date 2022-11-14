import { CrossChainTradeType, CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk';

export const TO_BACKEND_CROSS_CHAIN_PROVIDERS: Record<CrossChainTradeType, string> = {
  [CROSS_CHAIN_TRADE_TYPE.CELER]: 'celer',
  [CROSS_CHAIN_TRADE_TYPE.RANGO]: 'rango',
  [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: 'symbiosis',
  [CROSS_CHAIN_TRADE_TYPE.LIFI]: 'lifi',
  [CROSS_CHAIN_TRADE_TYPE.VIA]: 'via',
  [CROSS_CHAIN_TRADE_TYPE.BRIDGERS]: 'bridgers',
  [CROSS_CHAIN_TRADE_TYPE.DEBRIDGE]: 'debridge',
  [CROSS_CHAIN_TRADE_TYPE.MULTICHAIN]: 'multichain',
  [CROSS_CHAIN_TRADE_TYPE.CHAINGE]: 'chainge'
};
