import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const sushiSwapBscContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  testnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  testnet: '0xae13d989dac2f0debff460ac112a837c89baa7cd'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', symbol: 'WBNB' },
    { address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', symbol: 'CAKE' },
    { address: '0xe9e7cea3dedca5984780bafc599bd69add087d56', symbol: 'BUSD' },
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT' },
    { address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', symbol: 'BTCB' },
    { address: '0x23396cF899Ca06c4472205fC903bDB4de249D6fC', symbol: 'UST' },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'ETH' },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC' }
  ],
  testnet: [
    { address: '0xae13d989dac2f0debff460ac112a837c89baa7cd', symbol: 'WBNB' },
    { address: '0x8babbb98678facc7342735486c851abd7a0d17ca', symbol: 'ETH' }
  ]
};

export const SUSHI_SWAP_BSC_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  contractAddressNetMode: sushiSwapBscContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 3
};
