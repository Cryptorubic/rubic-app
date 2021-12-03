import { BigNumber } from 'bignumber.js';

export class RaydiumTokenAmount {
  public wei: BigNumber;

  public decimals: number;

  public _decimals: BigNumber;

  constructor(wei: number | string | BigNumber, decimals: number = 0, isWei = true) {
    this.decimals = decimals;
    this._decimals = new BigNumber(10).exponentiatedBy(decimals);
    this.wei = isWei ? new BigNumber(wei) : new BigNumber(wei).multipliedBy(this._decimals);
  }

  toEther(): BigNumber {
    return this.wei.dividedBy(this._decimals);
  }

  toWei(): BigNumber {
    return this.wei;
  }

  format(): string {
    const vaule = this.wei.dividedBy(this._decimals);
    return vaule.toFormat(vaule.isInteger() ? 0 : this.decimals);
  }

  fixed(): string {
    return this.wei.dividedBy(this._decimals).toFixed(this.decimals);
  }

  isNullOrZero(): boolean {
    return this.wei.isNaN() || this.wei.isZero();
  }
}
