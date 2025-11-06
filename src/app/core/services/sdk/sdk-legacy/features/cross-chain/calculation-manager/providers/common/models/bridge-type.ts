import { DEFAULT_BRIDGE_TYPE } from './default-bridge-type';
import { UNIQ_LIFI_BRIDGE_TYPES } from '../../lifi-provider/models/uniq-lifi-bridge-types';

export const BRIDGE_TYPE = {
  ...DEFAULT_BRIDGE_TYPE,
  ...UNIQ_LIFI_BRIDGE_TYPES
} as const;

export type BridgeType = (typeof BRIDGE_TYPE)[keyof typeof BRIDGE_TYPE];

export const bridges = Object.values(BRIDGE_TYPE);
