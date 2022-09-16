import { Configuration, RpcProvider } from 'rubic-sdk';
import networks from '@shared/constants/blockchain/networks';

const rpcProviders = networks.reduce((acc, curr) => {
  if (!curr.rpcList.length) {
    return acc;
  }
  const provider: RpcProvider = {
    rpcList: curr.rpcList,
    mainRpcTimeout: 8000,
    healthCheckTimeout: 5000
  };
  return { ...acc, [curr.name]: provider };
}, {});

export const rubicSdkDefaultConfig: Configuration = { rpcProviders };
