import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SuiBlockchainName
} from '@cryptorubic/core';
import { RubicStep } from '../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { OnChainTradeStruct } from '../evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { OnChainProxyFeeInfo } from '../../../models/on-chain-proxy-fee-info';

export interface SuiOnChainTradeStruct extends OnChainTradeStruct<SuiBlockchainName> {
  proxyFeeInfo?: OnChainProxyFeeInfo;
  fromWithoutFee: PriceTokenAmount<SuiBlockchainName>;
  path: RubicStep[];
  apiQuote?: QuoteRequestInterface;
  apiResponse?: QuoteResponseInterface;
}
