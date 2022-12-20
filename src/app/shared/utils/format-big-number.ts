import BigNumber from 'bignumber.js';
import { BIG_NUMBER_FORMAT } from '@shared/constants/formats/big-number-format';

export function formatBigNumber(value: BigNumber | string | number, dp = -1, toFixed = false) {
  if (typeof value === 'number') {
    value = value.toString();
  }

  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    value = new BigNumber(value.split(',').join(''));
  }

  if (dp !== -1) {
    return !toFixed
      ? value.dp(dp).toFormat(BIG_NUMBER_FORMAT)
      : value.toFormat(dp, BIG_NUMBER_FORMAT);
  }

  return value.toFormat(BIG_NUMBER_FORMAT);
}
