import { Token } from '@shared/models/tokens/token';

export interface ChangenowPostTrade {
  id: string;

  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;

  depositAddress: string;
  receiverAddress: string;

  extraField?: {
    name: string;
    value: string;
  };
}
