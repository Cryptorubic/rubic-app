import { PageType } from '../../shared-privacy-providers/components/page-navigation/models/page-type';

export const RAILGUN_PAGES: PageType[] = [
  {
    type: 'login',
    label: 'Login'
  },
  {
    type: 'wallet',
    label: 'Wallet'
  },
  {
    type: 'hide',
    label: 'Shield'
  },
  {
    type: 'transfer',
    label: 'Transfer'
  },
  {
    type: 'swap',
    label: 'Swap'
  },
  {
    type: 'reveal',
    label: 'Unshield'
  }
];
