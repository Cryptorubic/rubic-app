import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { RubicBridgeSupportedBlockchains } from '../models/types';

export const BRIDGE_BLOCKCHAIN_NUM: Partial<Record<RubicBridgeSupportedBlockchains, number>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1,
  [BLOCKCHAIN_NAME.ETHEREUM]: 2
};
