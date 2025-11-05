import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { TonBlockchainName } from '../../../../../../core/blockchain/models/blockchain-name';
import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { RubicStep } from '../../common/models/rubicStep';
import { TradeInfo } from '../../common/models/trade-info';
import { TonCrossChainTrade } from '../../common/ton-cross-chain-trade/ton-cross-chain-trade';
import { SymbiosisTonCrossChainTradeConstructor } from '../models/symbiosis-cross-chain-trade-constructor';
import { SymbiosisSwappingParams } from '../models/symbiosis-swapping-params';
import { SymbiosisUtils } from '../symbiosis-utils';
import { PriceTokenAmount } from '../../../../../../common/tokens/price-token-amount';

/**
 * Calculated Symbiosis cross-chain trade.
 */
export class SymbiosisCcrTonTrade extends TonCrossChainTrade {
    private readonly swappingParams: SymbiosisSwappingParams;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType = BRIDGE_TYPE.SYMBIOSIS;

    public readonly from: PriceTokenAmount<TonBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly feeInfo: FeeInfo;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number | null;

    public readonly gasData: GasData | null;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        throw new Error('Not implemented');
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    constructor(
        crossChainTrade: SymbiosisTonCrossChainTradeConstructor,
        providerAddress: string,
        routePath: RubicStep[],
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, apiQuote, apiResponse);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.swappingParams = crossChainTrade.swapParams;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.transitAmount = crossChainTrade.transitAmount;
        this.onChainSubtype = SymbiosisUtils.getSubtype(crossChainTrade.tradeType, crossChainTrade.to.blockchain);
        this.promotions = crossChainTrade?.promotions || [];
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
