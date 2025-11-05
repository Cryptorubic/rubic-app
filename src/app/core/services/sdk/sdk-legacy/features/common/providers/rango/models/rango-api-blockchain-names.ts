import { BLOCKCHAIN_NAME } from '../../../../../core/blockchain/models/blockchain-name';

import { RangoSupportedBlockchain } from './rango-supported-blockchains';

export const rangoApiBlockchainNames: Record<RangoSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
    [BLOCKCHAIN_NAME.POLYGON]: 'POLYGON',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'OPTIMISM',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'ARBITRUM',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX_CCHAIN',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BSC',
    [BLOCKCHAIN_NAME.CRONOS]: 'CRONOS',
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 'POLYGONZK',
    [BLOCKCHAIN_NAME.AURORA]: 'AURORA',
    [BLOCKCHAIN_NAME.BASE]: 'BASE',
    [BLOCKCHAIN_NAME.METIS]: 'METIS',
    [BLOCKCHAIN_NAME.ZK_SYNC]: 'ZKSYNC',
    [BLOCKCHAIN_NAME.LINEA]: 'LINEA',
    // [BLOCKCHAIN_NAME.FANTOM]: 'FANTOM',
    [BLOCKCHAIN_NAME.BLAST]: 'BLAST',
    [BLOCKCHAIN_NAME.SCROLL]: 'SCROLL'
    // [BLOCKCHAIN_NAME.BITCOIN]: 'BTC'
};

export type RangoBlockchainName = keyof typeof rangoApiBlockchainNames;
