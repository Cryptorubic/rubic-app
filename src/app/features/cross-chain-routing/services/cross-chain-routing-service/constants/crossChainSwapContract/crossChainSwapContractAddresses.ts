import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractAddressesNetMode } from 'src/app/shared/models/blockchain/NetMode';

export const supportedCrossChainSwapBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON
] as const;

export type SupportedCrossChainSwapBlockchain = typeof supportedCrossChainSwapBlockchains[number];

export const crossChainSwapContractAddresses: ContractAddressesNetMode<SupportedCrossChainSwapBlockchain> =
  {
    mainnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xb9a94be803eC1197A234406eF5c0113f503d3178',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xA9e72A4B449CA000994E1B9A1DE5994e24fb3511',
      [BLOCKCHAIN_NAME.POLYGON]: '0xfaed2233b783790d3BB7c1fDA60b41d1bF775A79'
    },
    testnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xB67968964457944c651673fB09f073d2E4a25D39',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x478af71D16Aa1BF8EfF322db2F644bDEb6c8DF0E',
      [BLOCKCHAIN_NAME.POLYGON]: '0xEd058F52c2CB6e893A14f2df02C9a704c1Ad3aEA'
    }
  };
