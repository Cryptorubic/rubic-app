import { FiatAsset } from '@shared/models/fiats/fiat-asset';

export function compareFiats(fiat0: FiatAsset, fiat1: FiatAsset): boolean {
  return fiat0?.symbol === fiat1?.symbol;
}
