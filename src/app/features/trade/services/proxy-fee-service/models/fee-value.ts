import { PercentType } from '@features/trade/services/proxy-fee-service/models/percent-type';

export type FeeValue = PercentType | { limit: number; type: PercentType }[];
