import { Injectable } from '@angular/core';
import { RefStablePool } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-pool';
import {
  STABLE_TOKENS_IDS,
  StableTokensIds
} from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/stable-tokens-ids';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import BigNumber from 'bignumber.js';
import { RefFinanceSwapService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/ref-finance-swap.service';

@Injectable({ providedIn: 'root' })
export class RefFinanceStableService {
  /**
   * Stable tokens decimals.
   */
  public static readonly stableLpTokenDecimals = 18;

  /**
   * Gets trade fee.
   * @param amount Amounts.
   * @param tradeFee Trade fee.
   */
  private static getTradeFee(amount: BigNumber, tradeFee: number): BigNumber {
    return amount.multipliedBy(tradeFee).dividedBy(RefFinanceSwapService.feeDivisor);
  }

  /**
   * Calculates D.
   * @param amp Amplification coefficient.
   * @param stableTokensAmounts Coins amounts.
   */
  private static calcD(amp: number, stableTokensAmounts: BigNumber[]): BigNumber {
    const totalTokens = stableTokensAmounts.length;
    const stableTokensTotalAmount = stableTokensAmounts.reduce(
      (sum, amount) => sum.plus(amount),
      new BigNumber(0)
    );
    let dPrev = new BigNumber(0);
    let d = stableTokensTotalAmount;
    for (let i = 0; i < 256; i++) {
      let dProd = d;
      for (let stableTokenAmount of stableTokensAmounts) {
        const divider = stableTokenAmount.multipliedBy(totalTokens);
        dProd = dProd.multipliedBy(d).dividedBy(divider);
      }
      dPrev = d;
      const ann = amp * totalTokens ** totalTokens;
      const numerator = dPrev.multipliedBy(
        dProd.multipliedBy(totalTokens).plus(stableTokensTotalAmount.multipliedBy(ann))
      );
      const denominator = dPrev.multipliedBy(ann - 1).plus(dProd.multipliedBy(totalTokens + 1));
      d = numerator.dividedBy(denominator);
      if (d.minus(dPrev).abs().lte(1)) break;
    }
    return d;
  }

  /**
   * Cals Y.
   * @param amplificationCoefficient Amplification coefficient.
   * @param XCAmount XC Amount.
   * @param stableTokensAmounts Current pool tokens amounts.
   * @param fromTokenId From token identifier.
   * @param toTokenId To token identifier.
   */
  private static calcY(
    amplificationCoefficient: number,
    XCAmount: BigNumber,
    stableTokensAmounts: BigNumber[],
    fromTokenId: number,
    toTokenId: number
  ): BigNumber {
    const totalTokens = stableTokensAmounts.length;
    const ann = amplificationCoefficient * totalTokens ** totalTokens;
    const d = RefFinanceStableService.calcD(amplificationCoefficient, stableTokensAmounts);
    let s = XCAmount;
    let c = d.multipliedBy(d).dividedBy(XCAmount);
    for (let tokenId = 0; tokenId < totalTokens; tokenId++) {
      if (tokenId !== fromTokenId && tokenId !== toTokenId) {
        s = stableTokensAmounts[tokenId].plus(s);
        c = c.multipliedBy(d).dividedBy(stableTokensAmounts[tokenId]);
      }
    }
    c = c.multipliedBy(d).dividedBy(ann * totalTokens ** totalTokens);
    const b = d.dividedBy(ann).plus(s);
    let yPrev = new BigNumber(0);
    let y = d;
    for (let i = 0; i < 256; i++) {
      yPrev = y;
      const yNumerator = y.multipliedBy(y).plus(c);
      const yDenominator = y.multipliedBy(2).plus(b).minus(d);
      y = yNumerator.dividedBy(yDenominator);
      if (y.minus(yPrev).abs().lte(1)) break;
    }

    return y;
  }

  /**
   * Calculates stable swap.
   * @param amplificationCoefficient Amp
   * @param fromTokenId From token identifier.
   * @param fromAmount From tokens amount.
   * @param toTokenId To token identifier.
   * @param currentPoolAmounts Tokens amounts.
   * @param tradeFee Trade fee.
   */
  private static calcSwap(
    amplificationCoefficient: number,
    fromTokenId: StableTokensIds,
    fromAmount: string,
    toTokenId: StableTokensIds,
    currentPoolAmounts: BigNumber[],
    tradeFee: number
  ): BigNumber {
    const y = RefFinanceStableService.calcY(
      amplificationCoefficient,
      currentPoolAmounts[fromTokenId].plus(fromAmount),
      currentPoolAmounts,
      fromTokenId,
      toTokenId
    );
    const amountOutWithoutFee = currentPoolAmounts[toTokenId].minus(y);
    const fee = RefFinanceStableService.getTradeFee(amountOutWithoutFee, tradeFee);
    return amountOutWithoutFee.minus(fee);
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
    amountIn: BigNumber,
    stablePool: RefStablePool
  ): BigNumber {
    const amp = stablePool.amp;
    const tradeFee = stablePool.total_fee;

    const fromTokenId = STABLE_TOKENS_IDS[fromAddress];
    const toTokenId = STABLE_TOKENS_IDS[toAddress];
    const currentPoolAmounts = stablePool.c_amounts.map(amount => new BigNumber(amount));
    const fromAmount = Web3Pure.toWei(amountIn, RefFinanceStableService.stableLpTokenDecimals);

    return RefFinanceStableService.calcSwap(
      amp,
      fromTokenId,
      fromAmount,
      toTokenId,
      currentPoolAmounts,
      tradeFee
    );
  }
}
