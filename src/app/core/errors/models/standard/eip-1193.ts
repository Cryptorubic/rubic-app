/**
 * Provider rpc errors.
 */
export const EIP_1193 = [
  {
    code: '4001',
    message: 'User Rejected Request',
    description: 'The user rejected the request.'
  },
  {
    code: '4100',
    message: 'Unauthorized',
    description: 'The requested method and/or account has not been authorized by the user.'
  },
  {
    code: '4200',
    message: 'Unsupported Method',
    description: 'The Provider does not support the requested method.'
  },
  {
    code: '4900',
    message: 'Disconnected',
    description: 'The Provider is disconnected from all chains.'
  },
  {
    code: '4901',
    message: 'Chain Disconnected',
    description: 'The Provider is not connected to the requested chain.'
  }
];
