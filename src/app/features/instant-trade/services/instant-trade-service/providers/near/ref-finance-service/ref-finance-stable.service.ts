import { Injectable } from '@angular/core';
import { RefStablePool } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-pool';
import { STABLE_TOKENS_IDS } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/stable-tokens-ids';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

@Injectable({ providedIn: 'root' })
export class RefFinanceStableService {
  /**
   * Stable tokens decimals.
   */
  private static stableLpTokenDecimals = 18;

  /**
   * Gets trade fee.
   * @param amount Amounts.
   * @param tradeFee Trade fee.
   */
  private static getTradeFee(amount: number, tradeFee: number): number {
    return (amount * tradeFee) / 10000;
  }

  /**
   * Calculates D.
   * @param amp AMP.
   * @param coinsAmounts Coins amounts.
   */
  private static calcD(amp: number, coinsAmounts: number[]): number {
    const tokenNumber = coinsAmounts.length;
    const sumAmounts = coinsAmounts.reduce((sum, amount) => sum + amount, 0);
    let dPrev = 0;
    let d = sumAmounts;
    for (let i = 0; i < 256; i++) {
      let dProd = d;
      for (let coinAmount of coinsAmounts) {
        dProd = (dProd * d) / (coinAmount * tokenNumber);
      }
      dPrev = d;
      const ann = amp * tokenNumber ** tokenNumber;
      const numerator = dPrev * (dProd * tokenNumber + ann * sumAmounts);
      const denominator = dPrev * (ann - 1) + dProd * (tokenNumber + 1);
      d = numerator / denominator;
      if (Math.abs(d - dPrev) <= 1) break;
    }
    return d;
  }

  /**
   * Cals Y.
   * @param amp Amp.
   * @param XCAmount XC Amount.
   * @param currentCoinAmounts Current coin amounts.
   * @param indexX Index X.
   * @param indexY Index Y.
   */
  private static calcY(
    amp: number,
    XCAmount: number,
    currentCoinAmounts: number[],
    indexX: number,
    indexY: number
  ): number {
    const tokenNUmber = currentCoinAmounts.length;
    const ann = amp * tokenNUmber ** tokenNUmber;
    const d = RefFinanceStableService.calcD(amp, currentCoinAmounts);
    let s = XCAmount;
    let c = (d * d) / XCAmount;
    for (let i = 0; i < tokenNUmber; i++) {
      if (i !== indexX && i !== indexY) {
        s += currentCoinAmounts[i];
        c = (c * d) / currentCoinAmounts[i];
      }
    }
    c = (c * d) / (ann * tokenNUmber ** tokenNUmber);
    const b = d / ann + s;
    let yPrev = 0;
    let y = d;
    for (let i = 0; i < 256; i++) {
      yPrev = y;
      const yNumerator = y ** 2 + c;
      const yDenominator = 2 * y + b - d;
      y = yNumerator / yDenominator;
      if (Math.abs(y - yPrev) <= 1) break;
    }

    return y;
  }

  /**
   * Calculates stable swap.
   * @param amp Amp
   * @param inTokenIdx From token identifier.
   * @param inCoinAmount From tokens amount.
   * @param outTokenIdx To token identifier.
   * @param oldCoinAmounts Tokens amounts.
   * @param tradeFee Trade fee.
   */
  private static calcSwap(
    amp: number,
    inTokenIdx: number,
    inCoinAmount: number,
    outTokenIdx: number,
    oldCoinAmounts: number[],
    tradeFee: number
  ): [number, number, number] {
    const y = RefFinanceStableService.calcY(
      amp,
      inCoinAmount + oldCoinAmounts[inTokenIdx],
      oldCoinAmounts,
      inTokenIdx,
      outTokenIdx
    );
    const dy = oldCoinAmounts[outTokenIdx] - y;
    const fee = RefFinanceStableService.getTradeFee(dy, tradeFee);
    const amountSwapped = dy - fee;
    return [amountSwapped, fee, dy];
  }

  public static scientificNotationToString(strParam: string): string {
    let flag = /e/.test(strParam);
    if (!flag) return strParam;

    let sysbol = true;
    if (/e-/.test(strParam)) {
      sysbol = false;
    }

    const negative = Number(strParam) < 0 ? '-' : '';

    let index = Number(strParam.match(/\d+$/)[0]);

    let basis = strParam.match(/[\d\.]+/)[0];

    const ifFraction = basis.includes('.');

    let wholeStr;
    let fractionStr;

    if (ifFraction) {
      wholeStr = basis.split('.')[0];
      fractionStr = basis.split('.')[1];
    } else {
      wholeStr = basis;
      fractionStr = '';
    }

    if (sysbol) {
      if (!ifFraction) {
        return negative + wholeStr.padEnd(index + wholeStr.length, '0');
      } else {
        if (fractionStr.length <= index) {
          return negative + wholeStr + fractionStr.padEnd(index, '0');
        } else {
          return (
            negative +
            wholeStr +
            fractionStr.substring(0, index) +
            '.' +
            fractionStr.substring(index)
          );
        }
      }
    } else {
      if (!ifFraction)
        return negative + wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.');
      else {
        return (
          negative +
          wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.') +
          fractionStr
        );
      }
    }
  }

  /**
   * Gets swapped amount out.
   * @param fromAddress From toked address.
   * @param toAddress To token address.
   * @param amountIn From tokens amount.
   * @param stablePool Stable pool information.
   */
  public static getSwappedAmount(
    fromAddress: string,
    toAddress: string,
    amountIn: string,
    stablePool: RefStablePool
  ): [number, number, number] {
    const amp = stablePool.amp;
    const tradeFee = stablePool.total_fee;

    const inTokenIdx = STABLE_TOKENS_IDS[fromAddress];
    const outTokenIdx = STABLE_TOKENS_IDS[toAddress];
    const oldCoinAmounts = stablePool.c_amounts.map(amount => Number(amount));
    const inCoinAmount = Number(
      Web3Pure.toWei(amountIn, RefFinanceStableService.stableLpTokenDecimals)
    );

    return RefFinanceStableService.calcSwap(
      amp,
      inTokenIdx,
      inCoinAmount,
      outTokenIdx,
      oldCoinAmounts,
      tradeFee
    );
  }
}
