import {
  BlockchainName,
  EvmBlockchainName,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface
} from '@cryptorubic/core';
import { RubicStep } from '../../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { IsDeflationToken } from '../../../../../../common/models/is-deflation-token';
import { GasFeeInfo } from './gas-fee-info';
import { OnChainProxyFeeInfo } from '../../../../models/on-chain-proxy-fee-info';

export interface OnChainTradeStruct<T extends BlockchainName> {
  from: PriceTokenAmount<T>;
  to: PriceTokenAmount<T>;

  slippageTolerance: number;

  gasFeeInfo: GasFeeInfo | null;

  useProxy: boolean;

  withDeflation: {
    from: IsDeflationToken;
    to: IsDeflationToken;
  };

  usedForCrossChain?: boolean;
}

export interface EvmOnChainTradeStruct extends OnChainTradeStruct<EvmBlockchainName> {
  permit2ApproveAddress?: string;
  proxyFeeInfo?: OnChainProxyFeeInfo;
  fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
  path: RubicStep[];
  apiQuote: QuoteRequestInterface | null;
  apiResponse: QuoteResponseInterface | null;
}
