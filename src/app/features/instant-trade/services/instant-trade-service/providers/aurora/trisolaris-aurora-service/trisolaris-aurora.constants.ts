import { ContractAddressNetMode } from '@shared/models/blockchain/net-mode';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import {
  RoutingProvidersNetMode,
  UniswapV2Constants
} from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';

const trisolarisContractAddressNetMode: ContractAddressNetMode = {
  mainnet: '0x2CB45Edb4517d5947aFdE3BEAbF95A582506858B',
  testnet: '0x26ec2aFBDFdFB972F106100A3deaE5887353d9B9'
};

const wethAddressNetMode: ContractAddressNetMode = {
  mainnet: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
  testnet: '0x1b6A3d5B5DCdF7a37CFE35CeBC0C4bD28eA7e946'
};

const routingProvidersNetMode: RoutingProvidersNetMode = {
  mainnet: [
    { address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB', symbol: 'WETH' },
    { address: '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d', symbol: 'wNEAR' },
    { address: '0xFa94348467f64D5A457F75F8bc40495D33c65aBB', symbol: 'TRI' },
    { address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', symbol: 'USDC' },
    { address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', symbol: 'USDT' },
    { address: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79', symbol: 'AURORA' },
    { address: '0xe3520349F477A5F6EB06107066048508498A291b', symbol: 'DAI' }
  ],
  testnet: [
    { address: '0x1b6A3d5B5DCdF7a37CFE35CeBC0C4bD28eA7e946', symbol: 'WETH' },
    { address: '0x8A65Fcf15Ed8FEb70fBA2D10D2fAFeaD4185835e', symbol: 'wNEAR' },
    { address: '0xf9f129292Ac618C9AbcFf8325517B446d326154d', symbol: 'TRI' },
    { address: '0x9c5061b4Fe43C95783a4Bb2D05D1B789c454c149', symbol: 'USDC' },
    { address: '0xfa1Ee6A11A8Ac851dEd1EF449878d1eE20D135EC', symbol: 'USDT' },
    { address: '0xaDeE31e4643D8891CaC9328B93BE002373428947', symbol: 'AURORA' },
    { address: '0x87Eba7597721C156240Ae7d8aE26e269118AFdca', symbol: 'DAI' }
  ]
};

export const TRISOLARIS_AURORA_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.AURORA,
  contractAddressNetMode: trisolarisContractAddressNetMode,
  wethAddressNetMode,
  routingProvidersNetMode,
  maxTransitTokens: 1
};
