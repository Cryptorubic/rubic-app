import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/uniswap-v2-constants';

const ZappyContractAddress = '0xb9239af0697c8efb42cba3568424b06753c6da71';

const wethAddress = '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E';

const routingProviders = [
  { address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E', symbol: 'WTLOS' },
  { address: '0x9a271e3748f59222f5581bae2540daa5806b3f77', symbol: 'ZAP' },
  { address: '0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73', symbol: 'USDT' },
  { address: '0xfa9343c3897324496a05fc75abed6bac29f8a40f', symbol: 'ETH' },
  { address: '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73', symbol: 'USDT' },
  { address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', symbol: 'USDC' },
  { address: '0x2c78f1b70ccf63cdee49f9233e9faa99d43aa07e', symbol: 'BNB' }
];

export const ZAPPY_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.TELOS,
  contractAddress: ZappyContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 3
};
