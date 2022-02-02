import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';

const wannaSwapContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xa3a1eF5Ae6561572023363862e238aFA84C72ef5',
  testnet: undefined
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
  testnet: '0x1b6A3d5B5DCdF7a37CFE35CeBC0C4bD28eA7e946'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB', symbol: 'WETH' },
    { address: '0x7faA64Faf54750a2E3eE621166635fEAF406Ab22', symbol: 'WANNA' },
    { address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', symbol: 'USDC' },
    { address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', symbol: 'USDT' },
    { address: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79', symbol: 'AURORA' },
    { address: '0xe3520349F477A5F6EB06107066048508498A291b', symbol: 'DAI' }
  ],
  testnet: [
    { address: '0x1b6A3d5B5DCdF7a37CFE35CeBC0C4bD28eA7e946', symbol: 'WETH' },
    { address: '0xDf361DC2e41CfaF998e158af197b91C399d1E4Ab', symbol: 'WANNA' },
    { address: '0x9c5061b4Fe43C95783a4Bb2D05D1B789c454c149', symbol: 'USDC' },
    { address: '0xfa1Ee6A11A8Ac851dEd1EF449878d1eE20D135EC', symbol: 'USDT' },
    { address: '0xaDeE31e4643D8891CaC9328B93BE002373428947', symbol: 'AURORA' },
    { address: '0x87Eba7597721C156240Ae7d8aE26e269118AFdca', symbol: 'DAI' }
  ]
};

export const WANNA_SWAP_AURORA_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.AURORA,
  contractAddressNetMode: wannaSwapContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 1
};
