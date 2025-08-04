import { Configuration, RpcProviders } from '@cryptorubic/sdk';
import { rpcList } from '@shared/constants/blockchain/rpc-list';

const rpcProviders = Object.keys(rpcList).reduce((acc, blockchain: keyof typeof rpcList) => {
  const provider = {
    rpcList: rpcList[blockchain],
    mainRpcTimeout: 8000
  };
  return { ...acc, [blockchain]: provider };
}, {} as RpcProviders);

export const rubicSdkDefaultConfig: Configuration = { rpcProviders };
