import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const sushiSwapSolarBeamContracts: ContractAddressNetMode = {
  mainnet: '0xAA30eF758139ae4a7f798112902Bf6d65612045f',
  // TODO: add  testnet address
  testnet: ''
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x98878B06940aE243284CA214f92Bb71a2b032B8A', // WMOVR
  // TODO: add testnet address
  testnet: ''
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0x98878B06940aE243284CA214f92Bb71a2b032B8A', symbol: 'WMOVR' },
    { address: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C', symbol: 'USDT' },
    { address: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', symbol: 'USDC' },
    { address: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844', symbol: 'DAI' },
    { address: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818', symbol: 'BUSD' },
    { address: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B', symbol: 'SOLAR' }
  ],
  testnet: []
};

export const SOLAR_BEAM_MOON_RIVER_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.MOONRIVER,
  contractAddressNetMode: sushiSwapSolarBeamContracts,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
