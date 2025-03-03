import {
  AvailableTokenAmount,
  TokenAmountWithPriceChange
} from '@app/shared/models/tokens/available-token-amount';
import BigNumber from 'bignumber.js';
import { blockchainRanks } from '../../blockchains-list-service/constants/blockchains-list';

export type TokensSorter = (a: AvailableTokenAmount, b: AvailableTokenAmount) => number;

export const sorterByChain: TokensSorter = (
  a: AvailableTokenAmount,
  b: AvailableTokenAmount
): number => {
  const aAmountInDollars = a.amount.isFinite()
    ? a.amount.multipliedBy(a.price === null ? 0 : a.price)
    : new BigNumber(0);
  const bAmountInDollars = b.amount.isFinite()
    ? b.amount.multipliedBy(b.price === null ? 0 : b.price)
    : new BigNumber(0);

  const aBalaceAvailability = a.amount?.gt(0);
  const bBalaceAvailability = b.amount?.gt(0);

  const availabilityComparison = Number(b.available) - Number(a.available);
  const amountsComparison = bAmountInDollars.minus(aAmountInDollars).toNumber();
  const balanceComparison = Number(bBalaceAvailability) - Number(aBalaceAvailability);
  const tokenRankComparison = b.rank - a.rank;
  const blockchainRankComparison = blockchainRanks[b.blockchain] - blockchainRanks[a.blockchain];
  const blockchainNameComparison =
    a.blockchain === b.blockchain ? 0 : a.blockchain > b.blockchain ? 1 : -1;

  return (
    availabilityComparison ||
    amountsComparison ||
    balanceComparison ||
    blockchainRankComparison ||
    blockchainNameComparison ||
    tokenRankComparison
  );
};

export const sorterByTokenRank: TokensSorter = (
  a: AvailableTokenAmount,
  b: AvailableTokenAmount
): number => {
  const aAmountInDollars = a.amount.isFinite()
    ? a.amount.multipliedBy(a.price === null ? 0 : a.price)
    : new BigNumber(0);
  const bAmountInDollars = b.amount.isFinite()
    ? b.amount.multipliedBy(b.price === null ? 0 : b.price)
    : new BigNumber(0);

  const aBalaceAvailability = a.amount?.gt(0);
  const bBalaceAvailability = b.amount?.gt(0);

  const availabilityComparison = Number(b.available) - Number(a.available);
  const amountsComparison = bAmountInDollars.minus(aAmountInDollars).toNumber();
  const balanceComparison = Number(bBalaceAvailability) - Number(aBalaceAvailability);
  const tokenRankComparison = b.rank - a.rank;
  const blockchainRankComparison = blockchainRanks[b.blockchain] - blockchainRanks[a.blockchain];
  const blockchainNameComparison =
    a.blockchain === b.blockchain ? 0 : a.blockchain > b.blockchain ? 1 : -1;

  return (
    availabilityComparison ||
    amountsComparison ||
    balanceComparison ||
    tokenRankComparison ||
    blockchainRankComparison ||
    blockchainNameComparison
  );
};

export const sorterForLosers: TokensSorter = (
  a: TokenAmountWithPriceChange,
  b: TokenAmountWithPriceChange
): number => {
  return a.priceChange24h - b.priceChange24h;
};

export const sorterForGainers: TokensSorter = (
  a: TokenAmountWithPriceChange,
  b: TokenAmountWithPriceChange
): number => {
  return b.priceChange24h - a.priceChange24h;
};
