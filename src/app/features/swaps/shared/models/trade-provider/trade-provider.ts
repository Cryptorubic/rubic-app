import { BridgeType, OnChainTradeType } from 'rubic-sdk';
import { RUBIC_BRIDGE_PROVIDER } from '@features/swaps/shared/models/trade-provider/bridge-provider';

export type TradeProvider = OnChainTradeType | RUBIC_BRIDGE_PROVIDER | BridgeType;
