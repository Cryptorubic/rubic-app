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

interface ITableTransaction {
    binanceId: string,
    fromNetwork: string,
    toNetwork: string,
    actualFromAmount: number,
    actualToAmount: number,
    img: string,
    ethSymbol: string,
    bscSymbol: string,
    creationTime: string,
    status: string
}

enum BridgeNetwork {
    ETHEREUM = 'ETH',
    BINANCE_SMART_CHAIN = 'BSC',
    ETHEREUM_TESTNET = 'KVN'
}

export {BridgeNetwork, IBridgeToken, ITableTransaction};
