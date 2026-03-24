import { PageType } from '@features/privacy/providers/shared-privacy-providers/components/page-navigation/models/page-type';

export const PAGE_TYPE_IMAGE: Record<PageType['type'], string> = {
  transfer: 'assets/images/private-swaps/navigation/transfer.svg',
  swap: 'assets/images/private-swaps/navigation/swap.svg',
  reveal: 'assets/images/private-swaps/navigation/unshield.svg',
  hide: 'assets/images/private-swaps/navigation/shield.svg',
  wallet: 'assets/images/private-swaps/navigation/wallet.svg',
  login: 'assets/images/private-swaps/navigation/login.svg',
  refund: 'assets/images/private-swaps/navigation/refund.svg',
  walletInfo: 'assets/images/private-swaps/navigation/wallet.svg'
};
