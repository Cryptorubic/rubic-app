import { WALLET_NAME } from '../models/wallet-name';

export const WALLETS_DEEP_LINK_MAPPING: Partial<Record<WALLET_NAME, () => string>> = {
  [WALLET_NAME.COIN_BASE]: () => 'https://go.cb-w.com/cDgO1V5aDlb',
  [WALLET_NAME.METAMASK]: () =>
    `https://metamask.app.link/dapp/${window.location.host}${window.location.search}`,
  [WALLET_NAME.BACKPACK]: () =>
    `https://backpack.app/ul/v1/browse/${encodeURIComponent(window.location.href)}?ref=${
      window.location.href
    }`,
  [WALLET_NAME.SOLFLARE]: () =>
    `https://solflare.com/ul/v1/browse/${encodeURIComponent(window.location.href)}?ref=${
      window.location.href
    }`,
  [WALLET_NAME.PHANTOM]: () =>
    `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${
      window.location.href
    }`
};
