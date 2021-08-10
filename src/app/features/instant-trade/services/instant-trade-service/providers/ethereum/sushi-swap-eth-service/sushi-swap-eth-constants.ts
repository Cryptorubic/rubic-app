import {
  ContractAddressNetMode,
  RoutingProvidersNetMode,
  UniswapV2Constants,
  WethAddressNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';

const sushiSwapContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  testnet: '0x5546e0295c7bb85b2fC00883B6025BA0Db06e50A'
};

const wethAddressNetMode: WethAddressNetMode = {
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnet: '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
  ],
  testnet: [
    '0xd0a1e359811322d97991e03f863a0c30c2cf029c', // WETH,
    '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c' // XEENUS
  ]
};

const maxTransitTokens = 1;

export const sushiSwapEthConstants: UniswapV2Constants = {
  contractAddressNetMode: sushiSwapContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens
};
