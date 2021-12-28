/**
 * RPC Errors.
 */
export const Eip1474 = [
  {
    code: '-32700',
    message: 'Parse error',
    description: 'Invalid JSON'
  },
  {
    code: '-32600',
    message: 'Invalid request',
    description: 'JSON is not a valid request object'
  },
  {
    code: '-32601',
    message: 'Method not found',
    description: 'Method does not exist'
  },
  {
    code: '-32602',
    message: 'Invalid params',
    description: 'Invalid method parameters'
  },
  {
    code: '-32603',
    message: 'Internal error',
    description: 'Internal JSON-RPC error'
  },
  {
    code: '-32000',
    message: 'Invalid input',
    description: 'Missing or invalid parameters'
  },
  {
    code: '-32001',
    message: 'Resource not found',
    description: 'Requested resource not found'
  },
  {
    code: '-32002',
    message: 'Resource unavailable',
    description: 'Requested resource not available'
  },
  {
    code: '-32003',
    message: 'Transaction rejected',
    description: 'Transaction creation failed'
  },
  {
    code: '-32004',
    message: 'Method not supported',
    description: 'Method is not implemented'
  },
  {
    code: '-32005',
    message: 'Limit exceeded',
    description: 'Request exceeds defined limit'
  },
  {
    code: '-32006',
    message: 'JSON-RPC version not supported',
    description: 'Version of JSON-RPC protocol is not supported'
  }
];
