import { FromBackendBlockchains } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';

export type PromotionResponse = PromotionResponseItem[];

export interface PromotionResponseItem {
  promoId: number;
  transactions: {
    hash: string;
    blockchain: FromBackendBlockchains;
    date: number;
  }[];
  totalRefundUSD: number;
  refundDate: number;
}
