import { AbiItem } from '@cryptorubic/web3';

export const gatewayRubicCrossChainAbi: AbiItem[] = [
  {
    inputs: [
      { internalType: 'address[]', name: 'tokens', type: 'address[]' },
      { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
      { internalType: 'bytes', name: 'facetCallData', type: 'bytes' }
    ],
    name: 'startViaRubic',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
];
