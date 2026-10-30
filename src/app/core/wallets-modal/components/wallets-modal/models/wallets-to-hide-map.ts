import { PRIVATE_MODE_URLS, PrivateProviderUrl } from '@app/features/privacy/models/routes';
import { WALLET_NAME } from './wallet-name';

export const WALLETS_TO_HIDE: Partial<Record<PrivateProviderUrl, WALLET_NAME[]>> = {
  [PRIVATE_MODE_URLS.PRIVACY_CASH]: [WALLET_NAME.METAMASK, WALLET_NAME.PHANTOM],
  [PRIVATE_MODE_URLS.RAILGUN]: [WALLET_NAME.METAMASK_SOLANA, WALLET_NAME.PHANTOM_SOLANA]
};
