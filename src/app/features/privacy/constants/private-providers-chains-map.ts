import { BlockchainName } from '@cryptorubic/core';
import { PrivateTradeType } from './private-trade-types';
import { PRIVACYCASH_SUPPORTED_CHAINS } from '../providers/privacycash/constants/chains';
import { RAILGUN_SUPPORTED_CHAINS } from '../providers/railgun/constants/network-map';
import { ZAMA_SUPPORTED_CHAINS } from '../providers/zama/constants/chains';
import { HINKAL_SUPPORTED_CHAINS } from '../providers/hinkal/constants/chains';
import { CLEARSWAP_SUPPORTED_CHAINS } from '../providers/clearswap/constants/clearswap-chains';

export const PRIVATE_PROVIDERS_CHAINS_MAP: Record<PrivateTradeType, Readonly<BlockchainName[]>> = {
  HINKAL: HINKAL_SUPPORTED_CHAINS,
  PRIVACY_CASH: PRIVACYCASH_SUPPORTED_CHAINS,
  RAILGUN: RAILGUN_SUPPORTED_CHAINS,
  ZAMA: ZAMA_SUPPORTED_CHAINS,
  CLEARSWAP: CLEARSWAP_SUPPORTED_CHAINS
};
