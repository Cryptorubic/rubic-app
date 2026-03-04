import { nativeTokensList } from '@cryptorubic/core';
import { WRAP_SOL_ADDRESS } from '../constants/privacycash-consts';
import { compareAddresses } from '@app/shared/utils/utils';

export function toRubicTokenAddr(tokenAddr: string): string {
  return compareAddresses(tokenAddr, WRAP_SOL_ADDRESS)
    ? nativeTokensList.SOLANA.address
    : tokenAddr;
}

export function toPrivacyCashTokenAddr(tokenAddr: string): string {
  return compareAddresses(tokenAddr, nativeTokensList.SOLANA.address)
    ? WRAP_SOL_ADDRESS
    : tokenAddr;
}
