import { BlockchainName } from '@cryptorubic/core';
import { PrivateTradeType } from './private-trade-types';
import { PrivateAction } from './private-mode-tx-types';
import { PRIVACYCAH_SUPPORTED_ACTIONS } from '../providers/privacycash/constants/actions';
import { HINKAL_SUPPORTED_ACTIONS } from '../providers/hinkal/constants/actions';
import { RAILGUN_SUPPORTED_ACTIONS } from '../providers/railgun/constants/actions';
import { ZAMA_SUPPORTED_ACTIONS } from '../providers/zama/constants/actions';

export const PRIVATE_PROVIDERS_ACTIONS_MAP: Record<
  PrivateTradeType,
  Partial<Record<BlockchainName, Readonly<PrivateAction[]>>>
> = {
  HINKAL: HINKAL_SUPPORTED_ACTIONS,
  PRIVACY_CASH: PRIVACYCAH_SUPPORTED_ACTIONS,
  ZAMA: ZAMA_SUPPORTED_ACTIONS,
  RAILGUN: RAILGUN_SUPPORTED_ACTIONS
};
