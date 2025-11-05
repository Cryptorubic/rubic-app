import { StaticToken } from './lifi-cross-chain-token';

export const exchangeTool = {
    ONEINCH: '1inch',
    PARASWAP: 'paraswap',
    OPENOCEAN: 'openocean',
    ZEROX: '0x',
    DODO: 'dodo',
    UNISWAP: 'uniswap',
    SUSHISWAP: 'sushiswap',
    QUICKSWAP: 'quickswap',
    HONEYSWAP: 'honeyswap',
    PANCAKESWAP: 'pancakeswap',
    SPIRITSWAP: 'spiritswap',
    SPOOKYSWAP: 'spookyswap',
    SOULSWAP: 'soulswap',
    PANGOLIN: 'pangolin',
    SOLARBEAM: 'solarbeam',
    STEALLASWAP: 'steallaswap',
    BEAMSWAP: 'beamswap',
    UBESWAP: 'ubeswap',
    CRONASWAP: 'cronaswap',
    DIFFUSION: 'diffusion',
    CRONUS: 'cronus',
    EVMOSWAP: 'evmoswap',
    OKCSWAP: 'okcswap',
    JSWAP: 'jswap',
    SWAPR: 'swapr',
    VOLTAGE: 'voltage',
    TRISOLARIS: 'trisolaris',
    WAGYUSWAP: 'wagyuswap',
    KYBERSWAP: 'kyberswap',
    ODOS: 'odos'
} as const;
export type ExchangeTool = (typeof exchangeTool)[keyof typeof exchangeTool];
export interface ExchangeAggregator {
    key: ExchangeTool;
    name: string;
    logoURI: string;
    webUrl: string;
}
export interface Exchange {
    key: string;
    name: string;
    chainId: number;
    logoURI: string;
    webUrl: string;
    graph?: string;
    tokenlistUrl: string;
    routerAddress: string;
    factoryAddress: string;
    initCodeHash: string;
    baseTokens: readonly StaticToken[];
}
