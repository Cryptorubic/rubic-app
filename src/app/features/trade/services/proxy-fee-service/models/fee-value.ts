import { PercentType } from './percent-type';

export type FeeValue = PercentType | { limit: number; type: PercentType }[];
