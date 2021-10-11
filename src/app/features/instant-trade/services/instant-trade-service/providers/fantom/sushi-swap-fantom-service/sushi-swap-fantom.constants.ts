import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

const sushiSwapFantomContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  testnet: undefined
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  testnet: '0x1957d5e8496628d755a4b2151bca03ecc379bdd6'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', // wFTM
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A' // fUSDT
  ],
  testnet: [
    '0x1957d5e8496628d755a4b2151bca03ecc379bdd6' // wFTM
  ]
};

export const sushiSwapFantomConstants: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.FANTOM,
  contractAddressNetMode: sushiSwapFantomContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 2
};
