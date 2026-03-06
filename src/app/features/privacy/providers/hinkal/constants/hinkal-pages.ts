import { PageType } from '../../shared-privacy-providers/components/page-navigation/models/page-type';

export const HINKAL_PAGES: PageType[] = [
  {
    type: 'info',
    label: 'Wallet Info'
  },
  {
    type: 'hide',
    label: 'Hide Tokens'
  },
  {
    type: 'transfer',
    label: 'Transfer'
  },
  {
    type: 'swap',
    label: 'Private Swap'
  },
  {
    type: 'reveal',
    label: 'Reveal Tokens'
  }
];
