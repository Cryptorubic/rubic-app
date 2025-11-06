import BigNumber from 'bignumber.js';

export function infiniteApproveAmount(): string {
  return new BigNumber(2).pow(256).minus(1).toFixed(0);
}
