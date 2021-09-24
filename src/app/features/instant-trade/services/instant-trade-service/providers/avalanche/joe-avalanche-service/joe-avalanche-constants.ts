import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

const joeAvalancheContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
  // TODO: Add testnet address
  testnet: ''
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  testnet: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd', // JOE
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', // USDT
    '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5', // QI
    '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4' // XAVA
  ],
  testnet: [
    '0xd00ae08403B9bbb9124bB305C09058E32C39A48c', // WAVAX
    '0xd00ae08403B9bbb9124bB305C09058E32C39A48c' // WAVAX
  ]
};

export const pangolinAvalancheConstants: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.AVALANCHE,
  contractAddressNetMode: joeAvalancheContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 3
};
