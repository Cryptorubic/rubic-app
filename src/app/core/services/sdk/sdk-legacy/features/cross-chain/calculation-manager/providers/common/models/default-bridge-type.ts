import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';

export const DEFAULT_BRIDGE_TYPE = {
    ...CROSS_CHAIN_TRADE_TYPE,

    ACROSS: 'across',
    AMAROK: 'connext',
    ANY_SWAP: 'anyswap',
    ARBITRUM_BRIDGE: 'arbitrum',
    AVALANCHE_BRIDGE: 'avalanche',

    CONNEXT: 'connext',
    CELERIM: 'celerim',

    HOP: 'hop',
    HYPHEN: 'hyphen',

    IBC: 'ibc',

    LI_FUEL: 'lifuel',

    MAKERS_WORMHOLE: 'maker',
    MAYA_PROTOCOL: 'mayaprotocol',
    MULTICHAIN: 'multichain',

    OPEN_OCEAN: 'openocean',
    OPTIMISM_GATEWAY: 'optimism',
    OSMOSIS_BRIDGE: 'osmosis',

    POLYGON: 'polygon',

    RAINBOW: 'rainbow',
    REFUEL: 'refuel',

    SATELLITE: 'satellite',
    STARGATE: 'stargate',
    SYMBIOSIS: 'symbiosis',
    SYNAPSE: 'synapse',

    THORCHAIN: 'thorchain',

    VOYAGER: 'voyager',

    WORMHOLE: 'wormhole',

    YPOOL: 'ypool'
} as const;

export type DefaultBridgeType = (typeof DEFAULT_BRIDGE_TYPE)[keyof typeof DEFAULT_BRIDGE_TYPE];
