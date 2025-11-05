interface Token {
    readonly chainId: number;
    readonly address: string;
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
    readonly logoURI: string;
    readonly coingeckoId: string;
}

interface FeeCost {
    readonly name: string;
    readonly description: string;
    readonly percentage: string;
    readonly token: Token;
    readonly amount: string;
    readonly amountUSD: string;
}

interface GasCost {
    readonly type: string;
    readonly token: Token;
    readonly amount: string;
    readonly amountUSD: string;
    readonly gasPrice: string;
    readonly maxFeePerGas: string;
    readonly maxPriorityFeePerGas: string;
    readonly estimate: string;
    readonly limit: string;
}

/**
 * Estimation object.
 */
export interface SquidrouterEstimation {
    readonly fromAmount: string;
    readonly sendAmount: string;
    readonly toAmount: string;
    readonly toAmountMin: string;
    readonly toAmountUSD: string;
    readonly actions: SquidrouterAction[];
    readonly feeCosts: FeeCost[];
    readonly gasCosts: GasCost[];
    readonly estimatedRouteDuration: number;
    readonly exchangeRate: string;
    readonly aggregatePriceImpact: string;
}

interface SquidrouterAction {
    chainType: string;
    description: string;
    provider: string;
    fromAmount: string;
    toAmount: string;
    fromChain: string;
    toChain: string;
    fromToken: Token;
    toToken: Token;
}
