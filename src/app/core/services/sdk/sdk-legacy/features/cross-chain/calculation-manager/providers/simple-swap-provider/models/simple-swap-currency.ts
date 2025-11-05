export interface SimpleSwapCurrency {
    name: string;
    ticker: string;
    network: string;
    legacySymbol: string;
    contractAddress: string | null;
    extraId: string;
    hasExtraId: boolean;
    validationExtra: string | null;
}
