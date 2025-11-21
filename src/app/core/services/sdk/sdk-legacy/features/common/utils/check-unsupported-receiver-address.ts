import { compareAddresses } from '@cryptorubic/core';
import { UnsupportedReceiverAddressError } from '@cryptorubic/web3';

export function checkUnsupportedReceiverAddress(
  receiverAddress?: string,
  fromAddress?: string
): void | never {
  if (receiverAddress && (!fromAddress || !compareAddresses(receiverAddress, fromAddress))) {
    throw new UnsupportedReceiverAddressError();
  }
}
