import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SolanaBlockchainName
} from '@cryptorubic/core';
import { RubicStep } from '../../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';

import { OnChainProxyFeeInfo } from '../../../../models/on-chain-proxy-fee-info';
import { OnChainTradeStruct } from '../../evm-on-chain-trade/models/evm-on-chain-trade-struct';

export interface SolanaOnChainTradeStruct extends OnChainTradeStruct<SolanaBlockchainName> {
  proxyFeeInfo?: OnChainProxyFeeInfo;
  fromWithoutFee: PriceTokenAmount<SolanaBlockchainName>;
  path: RubicStep[];
  apiQuote?: QuoteRequestInterface;
  apiResponse?: QuoteResponseInterface;
}
