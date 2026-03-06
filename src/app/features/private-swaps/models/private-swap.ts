import { TokenAmount } from '@cryptorubic/core';

export abstract class PrivateTrade {
  public abstract deposit(): Promise<void>;

  public abstract withdraw(): Promise<void>;

  public abstract swapUsingPrivateBalance(): Promise<void>;

  public abstract swapUsingWalletAndPrivateBalance(): Promise<void>;

  public abstract fetchPrivateBalance(): Promise<TokenAmount>;
}
