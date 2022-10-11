import { IframeAppearance } from '@core/services/iframe/models/iframe-appearance';

export interface IframeParameters {
  iframeAppearance: IframeAppearance;
  device?: 'desktop' | 'mobile';
  fee?: number;
  feeTarget?: string;
  promoCode?: string;
  tokenSearch?: boolean;
  rubicLink?: boolean;
}
