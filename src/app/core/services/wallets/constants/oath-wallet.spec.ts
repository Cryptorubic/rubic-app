import { oathConnectionLink, OATH_CHAIN_IDS } from './oath-wallet';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { CHAIN_SUPPORTED_WALLETS } from './chaintype-supported-wallets';
import { CHAIN_TYPE } from '@cryptorubic/core';

const pairing = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}`;

describe('Oath wallet listing and pairing contract', () => {
  it('encodes the complete pairing for the native app without dropping query parameters', () => {
    const url = new URL(oathConnectionLink(pairing));

    expect(url.protocol).toBe('oathwallet:');
    expect(url.hostname).toBe('wc');
    expect(url.searchParams.get('uri')).toBe(pairing);
    expect([...url.searchParams.keys()]).toEqual(['uri']);
  });

  it('rejects malformed, expired and non-pairing inputs', () => {
    for (const uri of [
      'https://example.com',
      'wc:abc@2',
      pairing.replace('irn', 'other'),
      `${pairing}&symKey=${'c'.repeat(64)}`,
      `${pairing}&expiryTimestamp=1`,
      pairing.replace('@2', '@1')
    ]) {
      expect(() => oathConnectionLink(uri)).toThrow();
    }
  });

  it('adds exactly one native card while retaining the generic WalletConnect card', () => {
    const oath = PROVIDERS_LIST.filter(provider => provider.value === WALLET_NAME.OATH);

    expect(oath.length).toBe(1);
    expect(oath[0].display && oath[0].supportsDesktop && oath[0].supportsMobile).toBeTrue();
    expect(oath[0].disabled).toBeFalse();
    expect(
      PROVIDERS_LIST.some(provider => provider.value === WALLET_NAME.WALLET_CONNECT)
    ).toBeTrue();

    expect(CHAIN_SUPPORTED_WALLETS[CHAIN_TYPE.EVM]).toContain(WALLET_NAME.OATH);
    expect(CHAIN_SUPPORTED_WALLETS[CHAIN_TYPE.SOLANA]).not.toContain(WALLET_NAME.OATH);
  });

  it('advertises only supported mainnets including Base, not testnets or Arc', () => {
    expect(OATH_CHAIN_IDS).toContain(1);
    expect(OATH_CHAIN_IDS).toContain(8453);
    expect(OATH_CHAIN_IDS).not.toContain(11155111);
    expect(OATH_CHAIN_IDS).not.toContain(5042);
    expect(OATH_CHAIN_IDS).not.toContain(324);
    expect(new Set(OATH_CHAIN_IDS).size).toBe(OATH_CHAIN_IDS.length);
  });
});
