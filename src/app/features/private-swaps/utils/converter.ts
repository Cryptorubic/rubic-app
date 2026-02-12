import { nativeTokensList } from '@cryptorubic/core';
import { WRAP_SOL_ADDRESS } from '../constants/privacycash-consts';

export function toRubicTokenAddr(tokenAddr: string): string {
  return tokenAddr === WRAP_SOL_ADDRESS ? nativeTokensList.SOLANA.address : tokenAddr;
}
