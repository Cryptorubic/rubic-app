import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { UniswapV2Constants } from '@features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/models/uniswap-v2-constants';

const sushiSwapTelosContractAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';

const wethAddress = '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E';

const routingProviders = [
  { address: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E', symbol: 'WTLOS' },
  { address: '0xf390830DF829cf22c53c8840554B98eafC5dCBc2', symbol: 'BTC' },
  { address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f', symbol: 'ETH' },
  { address: '0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73', symbol: 'USDT' },
  { address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', symbol: 'USDC' },
  { address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', symbol: 'BNB' },
  { address: '0x332730a4F6E03D9C55829435f10360E13cfA41Ff', symbol: 'MATIC' },
  { address: '0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D', symbol: 'AVAX' },
  { address: '0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4', symbol: 'FTM' },
  { address: '0x922D641a426DcFFaeF11680e5358F34d97d112E1', symbol: 'SUSHI' }
];

export const SUSHI_SWAP_TELOS_CONSTANTS: UniswapV2Constants = {
  blockchain: BLOCKCHAIN_NAME.TELOS,
  contractAddress: sushiSwapTelosContractAddress,
  wethAddress,
  routingProviders,
  maxTransitTokens: 3
};
