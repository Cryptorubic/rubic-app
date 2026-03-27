import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PRIVATE_MODE_URLS, PrivateProviderUrl } from '../models/routes';
import { PRIVACYCASH_SUPPORTED_WALLETS } from '../providers/privacycash/constants/wallets';
import { ZAMA_SUPPORTED_WALLETS } from '../providers/zama/constants/zama-supported-wallets';
import { HINKAL_SUPPORTED_WALLETS } from '../providers/hinkal/constants/hinkal-supported-wallets';
import {
  RAILGUN_MOBILE_SUPPORTED_WALLETS,
  RAILGUN_SUPPORTED_WALLETS
} from '@features/privacy/providers/railgun/constants/railgun-wallets';
import { CLEARSWAP_SUPPORTED_WALLETS } from '../providers/clearswap/constants/clearswap-supported-wallerts';

export const PRIVATE_PROVIDERS_WALLETS_MAP: Partial<Record<PrivateProviderUrl, WALLET_NAME[]>> = {
  [PRIVATE_MODE_URLS.PRIVACY_CASH]: PRIVACYCASH_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.ZAMA]: ZAMA_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.HINKAL]: HINKAL_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.RAILGUN]: RAILGUN_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.CLEARSWAP]: CLEARSWAP_SUPPORTED_WALLETS
};

export const PRIVATE_PROVIDERS_MOBILE_WALLETS_MAP: Partial<
  Record<PrivateProviderUrl, WALLET_NAME[]>
> = {
  [PRIVATE_MODE_URLS.PRIVACY_CASH]: PRIVACYCASH_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.ZAMA]: ZAMA_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.HINKAL]: HINKAL_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.RAILGUN]: RAILGUN_MOBILE_SUPPORTED_WALLETS,
  [PRIVATE_MODE_URLS.CLEARSWAP]: CLEARSWAP_SUPPORTED_WALLETS
};
