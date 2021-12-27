import BigNumber from 'bignumber.js';

export class Web3Pure {
  static toWei(amount: BigNumber | string | number, decimals = 18): string {
    return new BigNumber(amount || 0).times(new BigNumber(10).pow(decimals)).toFixed(0);
  }

  static fromWei(amountInWei: BigNumber | string | number, decimals = 18): BigNumber {
    return new BigNumber(amountInWei).div(new BigNumber(10).pow(decimals));
  }

  static calculateGasMargin(amount: BigNumber | string | number, percent: number): string {
    return new BigNumber(amount || '0').multipliedBy(percent).toFixed(0);
  }
}
