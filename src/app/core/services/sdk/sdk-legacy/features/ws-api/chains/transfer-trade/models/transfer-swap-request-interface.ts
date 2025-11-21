import { SwapRequestInterface } from '@cryptorubic/core';

export interface TransferSwapRequestInterface extends Omit<SwapRequestInterface, 'fromAddress'> {
  fromAddress?: string;
}
