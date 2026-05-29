import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { FhevmInstanceConfig } from '@zama-fhe/relayer-sdk/web';

export const ZAMA_INIT_CONFIG: Partial<
  Record<BlockchainName, Omit<FhevmInstanceConfig, 'network'>>
> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    aclContractAddress: '0xcA2E8f1F656CD25C01F05d0b243Ab1ecd4a8ffb6',
    kmsContractAddress: '0x77627828a55156b04Ac0DC0eb30467f1a552BB03',
    inputVerifierContractAddress: '0xCe0FC2e05CFff1B719EFF7169f7D80Af770c8EA2',
    verifyingContractAddressDecryption: '0x0f6024a97684f7d90ddb0fAAD79cB15F2C888D24',
    verifyingContractAddressInputVerification: '0xcB1bB072f38bdAF0F328CdEf1Fc6eDa1DF029287',
    chainId: 1,
    gatewayChainId: 261131,
    relayerUrl: 'https://x-api.rubic.exchange/zm/v2'
  }
};
