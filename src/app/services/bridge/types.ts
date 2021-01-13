interface IBridgeToken {
    name: string,
    symbol: string,
    bcSymbol: string,
    ethSymbol: string,
    bscSymbol: string,
    icon: string,
    minAmount: number,
    maxAmount: number,
    promotion: boolean,
    enabled: boolean,
    bscContractAddress: string,
    bscContractDecimal: number,
    ethContractAddress: string,
    ethContractDecimal: string
}

enum BridgeNetwork {
    ETHEREUM = 'ETH',
    BINANCE_SMART_CHAIN = 'BSC'
}

export {BridgeNetwork, IBridgeToken};
