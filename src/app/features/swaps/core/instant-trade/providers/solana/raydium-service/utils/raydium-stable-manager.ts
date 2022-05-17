import { LiquidityPoolInfo } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/pools';
import { SwapOutAmount } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/swap-out-amount';
import { RaydiumTokenAmount } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/raydium-token-amount';
import { getBigNumber } from '@shared/utils/utils';
import BigNumber from 'bignumber.js';
import { MODEL_DATA_INFO } from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/structure';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
// @ts-ignore
import { nu64, struct, u8 } from 'buffer-layout';
import {
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@features/swaps/core/instant-trade/providers/solana/raydium-service/models/accounts';

export interface StableModelLayout {
  accountType: number;
  status: number;
  multiplier: number;
  validDataCount: number;
  DataElement: { x: number; y: number; price: number }[];
}

export class RaydiumStableManager {
  public static readonly ELEMENT_SIZE = 50000;

  public static createRouteStableSwapOutInstruction(
    programId: PublicKey,
    ammProgramId: PublicKey,
    fromAmmId: PublicKey,
    toAmmId: PublicKey,
    ammAuthority: PublicKey,
    ammOpenOrders: PublicKey,
    poolCoinTokenAccount: PublicKey,
    poolPcTokenAccount: PublicKey,
    modelDataAccount: PublicKey,
    // serum
    serumProgramId: PublicKey,
    serumMarket: PublicKey,
    serumBids: PublicKey,
    serumAsks: PublicKey,
    serumEventQueue: PublicKey,
    serumCoinVaultAccount: PublicKey,
    serumPcVaultAccount: PublicKey,
    serumVaultSigner: PublicKey,
    // user
    userMiddleTokenAccount: PublicKey,
    userDestTokenAccount: PublicKey,
    userPdaAccount: PublicKey,
    userOwner: PublicKey
  ): TransactionInstruction {
    const dataLayout = struct([u8('instruction')]);

    const keys = [
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },

      // amm
      { pubkey: ammProgramId, isSigner: false, isWritable: false },
      { pubkey: fromAmmId, isSigner: false, isWritable: true },
      { pubkey: toAmmId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      { pubkey: modelDataAccount, isSigner: false, isWritable: true },
      // serum
      { pubkey: serumProgramId, isSigner: false, isWritable: false },
      { pubkey: serumMarket, isSigner: false, isWritable: true },
      { pubkey: serumBids, isSigner: false, isWritable: true },
      { pubkey: serumAsks, isSigner: false, isWritable: true },
      { pubkey: serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumVaultSigner, isSigner: false, isWritable: false },

      { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userDestTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPdaAccount, isSigner: false, isWritable: true },
      { pubkey: userOwner, isSigner: true, isWritable: false }
    ];

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 3
      },
      data
    );

    return new TransactionInstruction({
      keys,
      programId,
      data
    });
  }

  public static createRouteStableSwapInInstruction(
    programId: PublicKey,
    ammProgramId: PublicKey,
    fromAmmId: PublicKey,
    toAmmId: PublicKey,
    ammAuthority: PublicKey,
    ammOpenOrders: PublicKey,
    poolCoinTokenAccount: PublicKey,
    poolPcTokenAccount: PublicKey,
    modelDataAccount: PublicKey,
    // serum
    serumProgramId: PublicKey,
    serumMarket: PublicKey,
    serumBids: PublicKey,
    serumAsks: PublicKey,
    serumEventQueue: PublicKey,
    serumCoinVaultAccount: PublicKey,
    serumPcVaultAccount: PublicKey,
    serumVaultSigner: PublicKey,
    // user
    userSourceTokenAccount: PublicKey,
    userMiddleTokenAccount: PublicKey,
    userPdaAccount: PublicKey,
    userOwner: PublicKey,
    amountIn: number,
    minimunAmountOut: number
  ): TransactionInstruction {
    const dataLayout = struct([u8('instruction'), nu64('amountIn'), nu64('minimunAmountOut')]);

    const keys = [
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
      // spl token
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },

      // amm
      { pubkey: ammProgramId, isSigner: false, isWritable: false },
      { pubkey: fromAmmId, isSigner: false, isWritable: true },
      { pubkey: toAmmId, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: poolCoinTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolPcTokenAccount, isSigner: false, isWritable: true },
      { pubkey: modelDataAccount, isSigner: false, isWritable: true },
      // serum
      { pubkey: serumProgramId, isSigner: false, isWritable: false },
      { pubkey: serumMarket, isSigner: false, isWritable: true },
      { pubkey: serumBids, isSigner: false, isWritable: true },
      { pubkey: serumAsks, isSigner: false, isWritable: true },
      { pubkey: serumEventQueue, isSigner: false, isWritable: true },
      { pubkey: serumCoinVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumPcVaultAccount, isSigner: false, isWritable: true },
      { pubkey: serumVaultSigner, isSigner: false, isWritable: false },

      { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userMiddleTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPdaAccount, isSigner: false, isWritable: true },
      { pubkey: userOwner, isSigner: true, isWritable: false }
    ];

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 2,
        amountIn,
        minimunAmountOut
      },
      data
    );

    return new TransactionInstruction({
      keys,
      programId,
      data
    });
  }

  public static formatLayout(buffer: Buffer): StableModelLayout {
    const layoutInfo = MODEL_DATA_INFO.decode(buffer);
    return {
      accountType: layoutInfo.accountType.toNumber(),
      status: layoutInfo.status.toNumber(),
      multiplier: layoutInfo.multiplier.toNumber(),
      validDataCount: layoutInfo.validDataCount.toNumber(),
      DataElement: layoutInfo.DataElement.map(
        (item: { x: BigNumber; y: BigNumber; price: BigNumber }) => ({
          x: item.x.toNumber(),
          y: item.y.toNumber(),
          price: item.price.toNumber()
        })
      )
    };
  }

  constructor() {}

  public static getSwapOutAmountStable(
    poolInfo: LiquidityPoolInfo,
    fromCoinMint: string,
    toCoinMint: string,
    amount: string,
    slippage: number
  ): SwapOutAmount {
    const { coin, pc, fees } = poolInfo;
    const { swapFeeNumerator, swapFeeDenominator } = fees;

    const amountIn = new RaydiumTokenAmount(amount, coin.decimals, false)
      .toEther()
      .multipliedBy(swapFeeDenominator - swapFeeNumerator)
      .dividedBy(swapFeeDenominator);

    const coinBalance = coin.balance;
    const pcBalance = pc.balance;

    let inDecimals;
    let outDecimals;
    let amountOut = 0;

    let beforePrice, afterPrice;
    if (fromCoinMint === coin.mintAddress) {
      amountOut = amountIn.isNaN()
        ? 0
        : Math.abs(
            RaydiumStableManager.getDyByDxBaseIn(
              poolInfo.modelData,
              coinBalance.toNumber(),
              pcBalance.toNumber(),
              amountIn.toNumber()
            )
          );
      amountOut = amountOut > pcBalance.toNumber() ? pcBalance.toNumber() : amountOut;
      inDecimals = coin.decimals;
      outDecimals = pc.decimals;

      beforePrice = RaydiumStableManager.getStablePrice(
        poolInfo.modelData,
        coinBalance.toNumber(),
        pcBalance.toNumber(),
        true
      );
      const afterCoinBalance = coinBalance.plus(amountIn);
      const afterPcBalance = pcBalance.minus(amountOut);
      afterPrice = RaydiumStableManager.getStablePrice(
        poolInfo.modelData,
        afterCoinBalance.toNumber(),
        afterPcBalance.toNumber(),
        true
      );
    } else if (toCoinMint === coin.mintAddress) {
      amountOut = amountIn.isNaN()
        ? 0
        : Math.abs(
            RaydiumStableManager.getDxByDyBaseIn(
              poolInfo.modelData,
              coinBalance.toNumber(),
              pcBalance.toNumber(),
              amountIn.toNumber()
            )
          );
      amountOut = amountOut > coinBalance.toNumber() ? coinBalance.toNumber() : amountOut;
      inDecimals = pc.decimals;
      outDecimals = coin.decimals;

      beforePrice = RaydiumStableManager.getStablePrice(
        poolInfo.modelData,
        coinBalance.toNumber(),
        pcBalance.toNumber(),
        false
      );
      const afterCoinBalance = coinBalance.minus(amountIn);
      const afterPcBalance = pcBalance.plus(amountOut);
      afterPrice = RaydiumStableManager.getStablePrice(
        poolInfo.modelData,
        afterCoinBalance.toNumber(),
        afterPcBalance.toNumber(),
        false
      );
    }

    const amountOutWithSlippage = getBigNumber(amountOut) / (1 + slippage / 100);

    if (!beforePrice) beforePrice = 0;
    if (!afterPrice) afterPrice = 0;

    const priceImpact = Math.abs(((beforePrice - afterPrice) / beforePrice) * 100);

    return {
      amountIn: new RaydiumTokenAmount(amountIn.multipliedBy(10 ** inDecimals), inDecimals).toWei(),
      amountOut: new RaydiumTokenAmount(
        new BigNumber(amountOut).multipliedBy(10 ** outDecimals),
        outDecimals
      ).toEther(),
      amountOutWithSlippage: new RaydiumTokenAmount(
        amountOutWithSlippage * 10 ** pc.decimals,
        pc.decimals
      ).toEther(),
      priceImpact
    };
  }

  private static getDxByDyBaseIn(
    layoutData: StableModelLayout,
    xReal: number,
    yReal: number,
    dyReal: number
  ): number {
    const ratio = RaydiumStableManager.getRatio(layoutData, xReal, yReal);
    const x = RaydiumStableManager.realToTable(layoutData, xReal, ratio);
    const y = RaydiumStableManager.realToTable(layoutData, yReal, ratio);
    const dy = RaydiumStableManager.realToTable(layoutData, dyReal, ratio);
    const priceUp = false;
    const [p, x2, lessTrade, find] = RaydiumStableManager.getDataByY(layoutData, y, dy, priceUp);
    if (!find) return 0;
    if (lessTrade) {
      return (dyReal * p) / layoutData.multiplier;
    } else {
      const dx = x - x2;
      return RaydiumStableManager.tableToReal(layoutData, dx, ratio);
    }
  }

  private static getDyByDxBaseIn(
    layoutData: StableModelLayout,
    xReal: number,
    yReal: number,
    dxReal: number
  ): number {
    const ratio = RaydiumStableManager.getRatio(layoutData, xReal, yReal);
    const x = RaydiumStableManager.realToTable(layoutData, xReal, ratio);
    const y = RaydiumStableManager.realToTable(layoutData, yReal, ratio);
    const dx = RaydiumStableManager.realToTable(layoutData, dxReal, ratio);
    const priceUp = true;
    const [p, y2, lessTrade, find] = RaydiumStableManager.getDataByX(layoutData, x, dx, priceUp);
    if (!find) return 0;
    if (lessTrade) {
      return (dxReal * layoutData.multiplier) / p;
    } else {
      const dy = y - y2;
      return RaydiumStableManager.tableToReal(layoutData, dy, ratio);
    }
  }

  private static getStablePrice(
    layoutData: StableModelLayout,
    coinReal: number,
    pcReal: number,
    baseCoin: boolean
  ): number {
    const price =
      RaydiumStableManager.getMidPrice(
        layoutData,
        RaydiumStableManager.realToTable(
          layoutData,
          coinReal,
          RaydiumStableManager.getRatio(layoutData, coinReal, pcReal)
        )
      ) / layoutData.multiplier;
    return baseCoin ? price : 1 / price;
  }

  private static getMidPrice(layoutData: StableModelLayout, x: number): number {
    const ret = RaydiumStableManager.getDataByX(layoutData, x, 0, false);
    if (ret[3]) return ret[0];
    else return 0;
  }

  private static getDataByY(
    layoutData: StableModelLayout,
    y: number,
    dy: number,
    priceUp: boolean
  ): [number, number, boolean, boolean] {
    const yWithDy = priceUp ? y - dy : y + dy;
    const [minIdx, maxIdx, find] = RaydiumStableManager.getMinimumRangeByY(layoutData, yWithDy);
    if (!find) return [0, 0, false, find];
    if (minIdx === maxIdx)
      return [layoutData.DataElement[maxIdx].price, layoutData.DataElement[maxIdx].x, false, find];
    else {
      const x1 = layoutData.DataElement[minIdx].x;
      const x2 = layoutData.DataElement[maxIdx].x;
      const p1 = layoutData.DataElement[minIdx].price;
      const p2 = layoutData.DataElement[maxIdx].price;
      const y1 = layoutData.DataElement[minIdx].y;
      const y2 = layoutData.DataElement[maxIdx].y;

      if (y >= y2 && y <= y1) {
        return priceUp ? [p2, x2, true, find] : [p1, x1, true, find];
      } else {
        let p, x;
        if (priceUp) {
          p = p1 + ((p2 - p1) * (y1 - y)) / (y1 - y2);
          x = x1 + (p2 * (y1 - yWithDy)) / layoutData.multiplier;
        } else {
          p = p1 + ((p2 - p1) * (y1 - y)) / (y1 - y2);
          x = x2 - (p1 * (yWithDy - y2)) / layoutData.multiplier;
        }
        return [p, x, false, find];
      }
    }
  }

  private static getDataByX(
    layoutData: StableModelLayout,
    x: number,
    dx: number,
    priceUp: boolean
  ): [number, number, boolean, boolean] {
    const xWithDx = priceUp ? x + dx : x - dx;
    const [minIdx, maxIdx, find] = RaydiumStableManager.getMinimumRangeByX(layoutData, xWithDx);
    if (!find) return [0, 0, false, find];

    if (minIdx === maxIdx)
      return [layoutData.DataElement[maxIdx].price, layoutData.DataElement[maxIdx].y, false, find];
    else {
      const x1 = layoutData.DataElement[minIdx].x;
      const x2 = layoutData.DataElement[maxIdx].x;
      const p1 = layoutData.DataElement[minIdx].price;
      const p2 = layoutData.DataElement[maxIdx].price;
      const y1 = layoutData.DataElement[minIdx].y;
      const y2 = layoutData.DataElement[maxIdx].y;

      if (x >= x1 && x <= x2) {
        if (priceUp) return [p2, y2, true, find];
        else return [p1, y1, true, find];
      } else {
        let p, y;
        if (priceUp) {
          p = p1 + ((p2 - p1) * (x - x1)) / (x2 - x1);
          y = y1 - ((xWithDx - x1) * layoutData.multiplier) / p2;
        } else {
          p = p1 + ((p2 - p1) * (x - x1)) / (x2 - x1);
          y = y2 + ((x2 - xWithDx) * layoutData.multiplier) / p1;
        }
        return [p, y, false, find];
      }
    }
  }

  private static getMinimumRangeByY(
    layoutData: StableModelLayout,
    y: number
  ): [number, number, boolean] {
    const [min, max] = RaydiumStableManager.estimateRangeByY(y);
    let minRangeIdx = min;
    let maxRangeIdx = max;
    let mid = 0;
    const target = y;
    while (minRangeIdx <= maxRangeIdx) {
      mid = Math.floor((maxRangeIdx + minRangeIdx) / 2);
      if (mid <= 0 || mid >= RaydiumStableManager.ELEMENT_SIZE - 2) {
        return [mid, mid, false];
      }

      const cur = layoutData.DataElement[mid].y;
      const left = layoutData.DataElement[mid - 1].y;
      const right = layoutData.DataElement[mid + 1].y;
      if (target === cur) return [mid, mid, true];
      else if (target === left) return [mid - 1, mid - 1, true];
      else if (target === right) return [mid + 1, mid + 1, true];
      else if (target < right) {
        minRangeIdx = mid + 1;
      } else if (target < left && target > cur) return [mid - 1, mid, true];
      else if (target < cur && target > right) return [mid, mid + 1, true];
      else maxRangeIdx = mid - 1;
    }
    return [mid, mid, false];
  }

  private static getMinimumRangeByX(
    layoutData: StableModelLayout,
    x: number
  ): [number, number, boolean] {
    const [min, max] = RaydiumStableManager.estimateRangeByX(x);
    let minRangeIdx = min;
    let maxRangeIdx = max;
    let mid = 0;
    const target = x;
    while (minRangeIdx < maxRangeIdx) {
      mid = Math.floor((maxRangeIdx + minRangeIdx) / 2);

      if (mid <= 0 || mid > RaydiumStableManager.ELEMENT_SIZE - 2) {
        return [mid, mid, false];
      }
      const cur = layoutData.DataElement[mid].x;
      const left = layoutData.DataElement[mid - 1].x;
      const right = layoutData.DataElement[mid + 1].x;

      if (target === cur) return [mid, mid, true];
      else if (target === left) return [mid - 1, mid - 1, true];
      else if (target === right) return [mid + 1, mid + 1, true];
      else if (target < left) maxRangeIdx = mid - 1;
      else if (target > left && target < cur) return [mid - 1, mid, true];
      else if (target > cur && target < right) return [mid, mid + 1, true];
      else minRangeIdx = mid + 1;
    }
    return [mid, mid, false];
  }

  private static getRatio(layoutData: StableModelLayout, xReal: number, yReal: number): number {
    const [minRangeIdx, maxRangeIdx, find] = RaydiumStableManager.getMininumRangeByXyReal(
      layoutData,
      xReal,
      yReal
    );

    if (!find) {
      return 0;
    }

    if (minRangeIdx === maxRangeIdx) {
      const x = layoutData.DataElement[minRangeIdx].x;
      return (xReal * layoutData.multiplier) / x;
    } else {
      const x1 = layoutData.DataElement[minRangeIdx].x;
      const y1 = layoutData.DataElement[minRangeIdx].y;
      const x2 = layoutData.DataElement[maxRangeIdx].x;
      const y2 = layoutData.DataElement[maxRangeIdx].y;

      const xDenominator = yReal * (x2 * y1 - x1 * y2);
      const xNumerator1 = x1 * xDenominator;
      const xNumerator2 = (x2 - x1) * (xReal * y1 - x1 * yReal) * y2;

      const xNumerator = xNumerator1 + xNumerator2;
      return (xReal * layoutData.multiplier * xDenominator) / xNumerator;
    }
  }

  private static realToTable(
    layoutData: StableModelLayout,
    realValue: number,
    ratio: number
  ): number {
    return (realValue * layoutData.multiplier) / ratio;
  }

  private static tableToReal(
    layoutData: StableModelLayout,
    tableValue: number,
    ratio: number
  ): number {
    return (tableValue * ratio) / layoutData.multiplier;
  }

  private static estimateRangeByXyReal(_xReal: number, _yReal: number): [number, number] {
    return [0, RaydiumStableManager.ELEMENT_SIZE - 2];
  }

  private static estimateRangeByX(_x: number): [number, number] {
    return [0, RaydiumStableManager.ELEMENT_SIZE - 2];
  }

  private static estimateRangeByY(_y: number): [number, number] {
    return [0, RaydiumStableManager.ELEMENT_SIZE - 2];
  }

  private static getMininumRangeByXyReal(
    layoutData: StableModelLayout,
    xReal: number,
    yReal: number
  ): [number, number, boolean] {
    const [min, max] = RaydiumStableManager.estimateRangeByXyReal(xReal, yReal);
    let minRangeIdx = min;
    let maxRangeIdx = max;
    let mid = 0;
    const target = (xReal * layoutData.multiplier) / yReal;
    while (minRangeIdx <= maxRangeIdx) {
      mid = Math.floor((maxRangeIdx + minRangeIdx) / 2);
      if (mid === 0 || mid >= RaydiumStableManager.ELEMENT_SIZE - 2) {
        return [mid, mid, false];
      }
      const cur =
        (layoutData.DataElement[mid].x * layoutData.multiplier) / layoutData.DataElement[mid].y;
      const left =
        (layoutData.DataElement[mid - 1].x * layoutData.multiplier) /
        layoutData.DataElement[mid - 1].y;
      const right =
        (layoutData.DataElement[mid + 1].x * layoutData.multiplier) /
        layoutData.DataElement[mid + 1].y;

      if (target === cur) {
        return [mid, mid, true];
      } else if (target === left) {
        return [mid - 1, mid - 1, true];
      } else if (target === right) {
        return [mid + 1, mid + 1, true];
      } else if (target < left) {
        maxRangeIdx = mid - 1;
      } else if (target > left && target < cur) {
        return [mid - 1, mid, true];
      } else if (target > cur && target < right) {
        return [mid, mid + 1, true];
      } else {
        minRangeIdx = mid + 1;
      }
    }
    return [mid, mid, false];
  }
}
