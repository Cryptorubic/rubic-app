import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const sushiSwapMoonRiverContracts: ContractAddressNetMode = {
  mainnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  // TODO: add  testnet address
  testnet: ''
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d', // WMOVR
  // TODO: add testnet address
  testnet: ''
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d', symbol: 'WMOVR' },
    { address: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C', symbol: 'USDT' },
    { address: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', symbol: 'USDC' },
    { address: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844', symbol: 'DAI' },
    { address: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818', symbol: 'BUSD' }
  ],
  testnet: []
};

export const SUSHI_SWAP_MOON_RIVER_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.MOONRIVER,
  contractAddressNetMode: sushiSwapMoonRiverContracts,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
