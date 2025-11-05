export interface BaseToken {
    chainId: number;
    address: string;
}
export interface StaticToken extends BaseToken {
    symbol: string;
    decimals: number;
    name: string;
    coinKey?: string;
    logoURI?: string;
}

export interface LifiToken extends StaticToken {
    priceUSD: string;
}
