import { AbiItem } from 'web3-utils';

export const spotPriceContractAbi = [
  {
    inputs: [
      { internalType: 'contract IERC20', name: 'srcToken', type: 'address' },
      { internalType: 'bool', name: 'useSrcWrappers', type: 'bool' }
    ],
    name: 'getRateToEth',
    outputs: [{ internalType: 'uint256', name: 'weightedRate', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as AbiItem[];
