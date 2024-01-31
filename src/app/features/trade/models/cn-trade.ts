import { Token } from '@shared/models/tokens/token';

export interface ChangenowPostTrade {
  id: string;

  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;

  depositAddress: string;
  receiverAddress: string;

  timestamp: number;

  extraField?: {
    name?: string;
    value?: string;
  };
}
