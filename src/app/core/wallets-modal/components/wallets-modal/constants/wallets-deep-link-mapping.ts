import { RubicWindow } from '@app/shared/utils/rubic-window';
import { WALLET_NAME } from '../models/wallet-name';

export const WALLETS_DEEP_LINK_MAPPING: Partial<
  Record<WALLET_NAME, (window: RubicWindow) => string>
> = {
  [WALLET_NAME.COIN_BASE]: _window => 'https://go.cb-w.com/cDgO1V5aDlb',
  [WALLET_NAME.METAMASK]: window =>
    `https://metamask.app.link/dapp/${window.location.host}${window.location.search}`,
  [WALLET_NAME.METAMASK_SOLANA]: window =>
    `https://metamask.app.link/dapp/${window.location.host}${window.location.search}`,
  [WALLET_NAME.BACKPACK]: window =>
    `https://backpack.app/ul/v1/browse/${encodeURIComponent(window.location.href)}?ref=${
      window.location.href
    }`,
  [WALLET_NAME.SOLFLARE]: window =>
    `https://solflare.com/ul/v1/browse/${encodeURIComponent(window.location.href)}?ref=${
      window.location.href
    }`,
  [WALLET_NAME.PHANTOM]: window =>
    `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${
      window.location.href
    }`
};
