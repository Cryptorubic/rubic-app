import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { ContractAddressNetMode } from 'src/app/shared/models/blockchain/NetMode';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

const pangolinAvalancheContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
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
    '0x60781C2586D68229fde47564546784ab3fACA982', // PNG
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
  contractAddressNetMode: pangolinAvalancheContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 3
};
