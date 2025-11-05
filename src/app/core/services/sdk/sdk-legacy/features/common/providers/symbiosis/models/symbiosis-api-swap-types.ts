import { SymbiosisTokenInfo, SymbiosisTokenInfoWithAmount } from './symbiosis-api-common-types';

export interface SymbiosisSwapRequestBody {
    tokenAmountIn: SymbiosisTokenInfoWithAmount;
    tokenOut: SymbiosisTokenInfo;

    /* 1% = 100 etc. */
    slippage: number;

    /* senderAddress */
    from?: string;

    /* receiverAddress */
    to?: string;
}

export interface SymbiosisSwapResponse {
    kind: SymbiosisSwapResponseKind;
    fee: SymbiosisSwapResponseFee;
    priceImpact: string;
    tokenAmountOut: SymbiosisTokenInfoWithAmount;
    tokenAmountOutMin: SymbiosisTokenInfoWithAmount;
    amountInUsd: SymbiosisTokenInfoWithAmount;
    tx: SymbiosisSwapResponseTx;
    approveTo: string;
    route: SymbiosisTokenInfo[];
    outTradeType: string;
    type: 'tron' | 'evm';
}

interface SymbiosisSwapResponseTx {
    chainId: number;
    data: string;
    to: string;
    value: string;
}

interface SymbiosisSwapResponseFee {
    address: string;
    chainId: number;
    decimals: number;
    symbol: string;
    icon: string;
    amount: string;
}

type SymbiosisSwapResponseKind = 'onchain-swap' | 'crosschain-swap' | 'wrap' | 'unwrap' | 'bridge';
