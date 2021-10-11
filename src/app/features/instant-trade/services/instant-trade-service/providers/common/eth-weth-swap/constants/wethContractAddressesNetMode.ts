import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ContractAddressesNetMode } from 'src/app/shared/models/blockchain/NetMode';

export const supportedEthWethSwapBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.FANTOM
] as const;

export type SupportedEthWethSwapBlockchain = typeof supportedEthWethSwapBlockchains[number];

export const wethContractAddressesNetMode: ContractAddressesNetMode<SupportedEthWethSwapBlockchain> =
  {
    mainnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      [BLOCKCHAIN_NAME.POLYGON]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      [BLOCKCHAIN_NAME.HARMONY]: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a',
      [BLOCKCHAIN_NAME.FANTOM]: '0xF491e7B69E4244ad4002BC14e878a34207E38c29'
    },
    testnet: {
      [BLOCKCHAIN_NAME.ETHEREUM]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
      [BLOCKCHAIN_NAME.POLYGON]: '0x13c038147aa2c91cf1fdb6f17a12f27715a4ca99',
      [BLOCKCHAIN_NAME.HARMONY]: '0xc0320368514b7961256d62bd7bc984623c0f7f65',
      [BLOCKCHAIN_NAME.FANTOM]: undefined
    }
  };
