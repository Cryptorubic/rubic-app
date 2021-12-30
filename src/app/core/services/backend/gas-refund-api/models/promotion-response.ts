import { FromBackendBlockchain } from '@shared/constants/blockchain/backend-blockchains';

export type PromotionResponse = PromotionResponseItem[];

export interface PromotionResponseItem {
  promoId: number;
  transactions: {
    hash: string;
    blockchain: FromBackendBlockchain;
    date: number; // in seconds
  }[];
  totalRefundUSD: number;
  refundDate: number; // in seconds
}
