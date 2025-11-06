import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';
import { RpcProviders } from '../sdk-legacy/features/common/models/sdk-models/rpc-provider';
import { ViemChainConfig } from '../sdk-legacy/features/common/models/sdk-models/viem-config';
import { Configuration } from '../sdk-legacy/features/common/models/sdk-models/configuration';

const rpcProviders = Object.keys(rpcList).reduce((acc, blockchain: keyof typeof rpcList) => {
  const provider = {
    rpcList: rpcList[blockchain],
    mainRpcTimeout: 8000
  };
  return { ...acc, [blockchain]: provider };
}, {} as RpcProviders);

const viemConfig = Object.keys(rpcList)
  .filter((el: BlockchainName) => BlockchainsInfo.isEvmBlockchainName(el))
  .reduce((acc, blockchain) => {
    return {
      ...acc,
      [blockchain]: {
        transportConfig: {
          batch: { batchSize: 2_000, wait: 10 },
          onFetchResponse: console.error,
          retryCount: 0,
          timeout: 5_000
        },
        fallbackConfig: {
          rank: false,
          retryCount: 1
        }
      }
    };
  }, {} as ViemChainConfig);

export const rubicSdkDefaultConfig: Configuration = { rpcProviders, viemConfig };
