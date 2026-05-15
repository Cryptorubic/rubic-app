import {
  BlockchainName,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface
} from '@cryptorubic/core';
import { FeeInfo } from '../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../cross-chain/calculation-manager/providers/common/models/rubicStep';

export interface ApiCrossChainConstructor<T extends BlockchainName> {
  from: PriceTokenAmount<T>;
  to: PriceTokenAmount;
  feeInfo: FeeInfo;
  apiQuote: QuoteRequestInterface;
  apiResponse: QuoteResponseInterface;
  routePath: RubicStep[];
  needAuthWallet?: boolean;
}
