import { PercentType } from 'rubic-sdk';

export type FeeValue = PercentType | { limit: number; type: PercentType }[];
