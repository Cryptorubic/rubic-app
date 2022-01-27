import { IframeAppearance } from '@core/services/iframe/models/iframe-appearance';

export interface IframeParameters {
  iframeAppearance: IframeAppearance;
  device?: 'desktop' | 'mobile';
}
