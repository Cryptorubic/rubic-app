import { PageType } from '@app/features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';

export const PRIVACYCASH_PAGES: PageType[] = [
  { label: 'Login', type: 'login' },
  { label: 'Shield tokens', type: 'hide' },
  { label: 'Transfer tokens', type: 'transfer' },
  { label: 'Swap tokens', type: 'swap' },
  { label: 'Unshield tokens', type: 'reveal' },
  { label: 'Refund tokens', type: 'refund' }
];
