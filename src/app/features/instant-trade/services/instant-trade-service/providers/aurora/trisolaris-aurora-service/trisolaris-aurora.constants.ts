import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/uniswap-v2-constants';

const trisolarisContractAddress = '0x2CB45Edb4517d5947aFdE3BEAbF95A582506858B';

const wethAddress = '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB';

const routingProviders = [
  { address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB', symbol: 'WETH' },
  { address: '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d', symbol: 'wNEAR' },
  { address: '0xFa94348467f64D5A457F75F8bc40495D33c65aBB', symbol: 'TRI' },
  { address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', symbol: 'USDC' },
  { address: '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', symbol: 'USDT' },
  { address: '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79', symbol: 'AURORA' },
  { address: '0xe3520349F477A5F6EB06107066048508498A291b', symbol: 'DAI' }
];

export const TRISOLARIS_AURORA_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.AURORA,
  contractAddress: trisolarisContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 1
};
