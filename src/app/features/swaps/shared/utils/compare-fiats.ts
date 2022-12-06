import { FiatAsset } from '@features/swaps/core/services/fiats-selector-service/models/fiat-asset';

export function compareFiats(fiat0: FiatAsset, fiat1: FiatAsset): boolean {
  return fiat0?.symbol === fiat1?.symbol;
}
