export enum RateLevel {
  NOTHING,
  FINE,
  WARNING,
  ERROR
}

export interface RateLevelData {
  imgSrc: string;
  class: string;
}

const baseImgSrc = 'assets/images/icons/';

export const rateLevelsData: Record<RateLevel, RateLevelData> = {
  [RateLevel.NOTHING]: {
    imgSrc: `${baseImgSrc}tick.svg`,
    class: ''
  },
  [RateLevel.FINE]: {
    imgSrc: `${baseImgSrc}tick.svg`,
    class: 'fine'
  },
  [RateLevel.WARNING]: {
    imgSrc: `${baseImgSrc}exclamation-yellow.svg`,
    class: 'warning'
  },
  [RateLevel.ERROR]: {
    imgSrc: `${baseImgSrc}exclamation-red.svg`,
    class: 'error'
  }
};
