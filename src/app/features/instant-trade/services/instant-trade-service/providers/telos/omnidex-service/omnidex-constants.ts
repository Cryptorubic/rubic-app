import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/models/uniswap-v2/uniswap-v2-constants';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

const OmnidexContractAddress = '0xF9678db1CE83f6f51E5df348E2Cc842Ca51EfEc1';

const wethAddress = '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E';

const routingProviders = [
  { address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E', symbol: 'WTLOS' },
  { address: '0x730d2fa7dc7642e041bce231e85b39e9bf4a6a64', symbol: 'KARMA' },
  { address: '0xfa9343c3897324496a05fc75abed6bac29f8a40f', symbol: 'ETH' },
  { address: '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73', symbol: 'USDT' },
  { address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', symbol: 'USDC' },
  { address: '0x2c78f1b70ccf63cdee49f9233e9faa99d43aa07e', symbol: 'BNB' },
  { address: '0xd2504a02fabd7e546e41ad39597c377ca8b0e1df', symbol: 'CHARM' }
];

export const OMNIDEX_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.TELOS,
  contractAddress: OmnidexContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 3
};
