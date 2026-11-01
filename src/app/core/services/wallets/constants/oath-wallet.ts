import { blockchainId, EVM_BLOCKCHAIN_NAME } from '@cryptorubic/core';

export const OATH_APP_STORE = 'https://apps.apple.com/app/id6780187283';

// Oath EVMSendNetwork mainnets, excluding Arc's separate signing path.
// Intersect with Rubic's networks; do not advertise other wallet namespaces.
const OATH_EVM_CHAIN_IDS = new Set([
  1, 42161, 43114, 8453, 56, 250, 14, 5031, 1514, 100, 59144, 10, 137, 88888, 42220, 143, 130, 999,
  4663, 534352, 167000, 40, 196, 314, 1329, 16661, 4689
]);

export const OATH_BLOCKCHAINS = Object.values(EVM_BLOCKCHAIN_NAME).filter(chain =>
  OATH_EVM_CHAIN_IDS.has(blockchainId[chain])
);
export const OATH_CHAIN_IDS = OATH_BLOCKCHAINS.map(chain => blockchainId[chain]);

export function oathConnectionLink(uri: string): string {
  // Never hand arbitrary schemes, redirect parameters or incomplete pairings to the app.
  const match = /^wc:([a-f0-9]{64})@2\?(.+)$/i.exec(uri);
  if (!match || uri.length > 8192) throw new Error('Invalid WalletConnect pairing');
  const params = new URLSearchParams(match[2]);
  if (
    params.getAll('symKey').length !== 1 ||
    !/^[a-f0-9]{64}$/i.test(params.get('symKey') || '') ||
    params.getAll('relay-protocol').length !== 1 ||
    params.get('relay-protocol') !== 'irn' ||
    (params.has('expiryTimestamp') &&
      (!/^\d+$/.test(params.get('expiryTimestamp')) ||
        Number(params.get('expiryTimestamp')) <= Date.now() / 1000))
  )
    throw new Error('Invalid WalletConnect pairing');
  return `oathwallet://wc?uri=${encodeURIComponent(uri)}`;
}
