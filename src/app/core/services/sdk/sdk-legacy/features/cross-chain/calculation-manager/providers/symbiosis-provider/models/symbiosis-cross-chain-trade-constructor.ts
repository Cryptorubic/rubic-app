import BigNumber from 'bignumber.js';
import {
    BitcoinBlockchainName,
    BlockchainName,
    EvmBlockchainName,
    TonBlockchainName,
    TronBlockchainName
} from '../../../../../../core/blockchain/models/blockchain-name';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { SymbiosisSwappingParams } from './symbiosis-swapping-params';
import { SymbiosisTradeType } from './symbiosis-trade-data';

import { FeeInfo } from '../../common/models/fee-info';
import { PriceTokenAmount } from '../../../../../../common/tokens/price-token-amount';

export interface SymbiosisCrossChainTradeConstructor<Blockchain extends BlockchainName> {
    from: PriceTokenAmount<Blockchain>;
    to: PriceTokenAmount;
    gasData: GasData | null;
    priceImpact: number | null;
    slippage: number;
    feeInfo: FeeInfo;
    transitAmount: BigNumber;
    tradeType: { in?: SymbiosisTradeType; out?: SymbiosisTradeType };
    contractAddresses: { providerRouter: string; providerGateway: string };
    swapParams: SymbiosisSwappingParams;
    promotions?: string[];
}

export type SymbiosisEvmCrossChainTradeConstructor = SymbiosisCrossChainTradeConstructor<EvmBlockchainName>;

export type SymbiosisTonCrossChainTradeConstructor = SymbiosisCrossChainTradeConstructor<TonBlockchainName>;

export type SymbiosisTronCrossChainTradeConstructor = SymbiosisCrossChainTradeConstructor<TronBlockchainName>;

export type SymbiosisbitcoinCrossChainTradeConstructor = SymbiosisCrossChainTradeConstructor<BitcoinBlockchainName>;
