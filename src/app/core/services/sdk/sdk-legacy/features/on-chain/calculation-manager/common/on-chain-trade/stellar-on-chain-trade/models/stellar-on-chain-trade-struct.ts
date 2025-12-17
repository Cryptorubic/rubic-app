import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  StellarBlockchainName
} from '@cryptorubic/core';
import { OnChainTradeStruct } from '../../evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { OnChainProxyFeeInfo } from '../../../../models/on-chain-proxy-fee-info';
import { RubicStep } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

export interface StellarOnChainTradeStruct extends OnChainTradeStruct<StellarBlockchainName> {
  proxyFeeInfo?: OnChainProxyFeeInfo;
  from: PriceTokenAmount<StellarBlockchainName>;
  path: RubicStep[];
  apiQuote?: QuoteRequestInterface;
  apiResponse?: QuoteResponseInterface;
}
