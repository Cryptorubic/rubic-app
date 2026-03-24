import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PRIVATE_MODE_URLS, PrivateProviderUrl } from '../models/routes';
import { PRIVACYCASH_SUPPORTED_WALLETS } from '../providers/privacycash/constants/wallets';
import { ZAMA_SUPPORTED_WALLETS } from '../providers/zama/constants/zama-supported-wallets';
import { HINKAL_SUPPORTED_WALLETS } from '../providers/hinkal/constants/hinkal-supported-wallets';

export const PRIVATE_PROVIDERS_WALLETS_MAP: Partial<Record<PrivateProviderUrl, WALLET_NAME[]>> = {
  [PRIVATE_MODE_URLS.PRIVACY_CASH]: PRIVACYCASH_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.ZAMA]: ZAMA_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.HINKAL]: HINKAL_SUPPORTED_WALLETS
};
