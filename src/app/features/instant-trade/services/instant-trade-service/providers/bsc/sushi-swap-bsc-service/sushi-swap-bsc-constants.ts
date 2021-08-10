import {
  ContractAddressNetMode,
  RoutingProvidersNetMode,
  UniswapV2Constants,
  WethAddressNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';

const sushiSwapBscContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  testnet: ''
};

const wethAddressNetMode: WethAddressNetMode = {
  mainnet: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  testnet: '0xae13d989dac2f0debff460ac112a837c89baa7cd'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WETH
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', // CAKE
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
    '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63' // XVS
  ],
  testnet: [
    '0xae13d989dac2f0debff460ac112a837c89baa7cd', // WETH,
    '0xae13d989dac2f0debff460ac112a837c89baa7cd' // WBNB
  ]
};

const maxTransitTokens = 3;

export const sushiSwapBscConstants: UniswapV2Constants = {
  contractAddressNetMode: sushiSwapBscContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens
};
