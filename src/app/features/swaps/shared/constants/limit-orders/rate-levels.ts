export enum RateLevel {
  NOTHING,
  GREEN,
  YELLOW,
  RED
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
  [RateLevel.GREEN]: {
    imgSrc: `${baseImgSrc}tick.svg`,
    class: 'green'
  },
  [RateLevel.YELLOW]: {
    imgSrc: `${baseImgSrc}exclamation-yellow.svg`,
    class: 'yellow'
  },
  [RateLevel.RED]: {
    imgSrc: `${baseImgSrc}exclamation-red.svg`,
    class: 'red'
  }
};
