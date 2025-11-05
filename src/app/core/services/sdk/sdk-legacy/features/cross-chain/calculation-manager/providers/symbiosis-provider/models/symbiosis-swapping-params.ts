import { SymbiosisToken, SymbiosisTokenAmount } from './symbiosis-trade-data';

export type SymbiosisSwappingParams = {
    tokenAmountIn: SymbiosisTokenAmount;
    tokenOut: SymbiosisToken;
    from: string;
    to: string;
    revertableAddress: string;
    slippage: number;
    deadline: number;
};
