import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const sushiSwapPolygonContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  testnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  testnet: '0x13c038147aa2c91cf1fdb6f17a12f27715a4ca99'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC' },
    { address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', symbol: 'WETH' },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', symbol: 'DAI' },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT' },
    { address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', symbol: 'USDC' },
    { address: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13', symbol: 'QUICK' }
  ],
  testnet: [
    { address: '0x13c038147aa2c91cf1fdb6f17a12f27715a4ca99', symbol: 'WMATIC' },
    { address: '0x5aeb1bbcb4f83fdf2c440028b7725bdd358a9afc', symbol: 'USDT' }
  ]
};

export const sushiSwapPolygonConstants: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.POLYGON,
  contractAddressNetMode: sushiSwapPolygonContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 3
};
