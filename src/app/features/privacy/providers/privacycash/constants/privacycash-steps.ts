import { PageType } from '@app/features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';

export const PRIVACYCASH_PAGES: PageType[] = [
  //{ label: 'Login', type: 'login' },
  { label: 'Deposit', type: 'hide' },
  // { label: 'Transfer', type: 'transfer' },
  // { label: 'Swap', type: 'swap' },
  { label: 'Stealth Send', type: 'reveal' }
  //{ label: 'Refund', type: 'refund' }
];
