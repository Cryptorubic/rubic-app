export interface XverseAccountsChangedEvent {
  addresses: Array<{
    address: string;
    publicKey: string;
    purpose: 'payment' | 'ordinals' | 'stacks' | 'starknet' | 'ordinals' | 'spark';
    addressType: string;
    walletType: string;
    scriptPubKey: string;
  }>;
}
