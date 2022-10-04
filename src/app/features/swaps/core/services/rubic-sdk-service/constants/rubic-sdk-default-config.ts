import { Configuration, RpcProviders } from 'rubic-sdk';
import networks from '@shared/constants/blockchain/networks';

const rpcProviders = networks.reduce((acc, curr) => {
  if (!curr.rpcList.length) {
    return acc;
  }
  const provider = {
    rpcList: curr.rpcList,
    mainRpcTimeout: 8000
  };
  return { ...acc, [curr.name]: provider };
}, {} as RpcProviders);

export const rubicSdkDefaultConfig: Configuration = { rpcProviders };
