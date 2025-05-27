import { pageState } from '@features/testnet-promo/constants/page-state';

export type PageState = (typeof pageState)[keyof typeof pageState];
