export enum ERROR_TYPE {
  WRONG_BLOCKCHAIN = 'Wrong user network',
  MULTICHAIN_WALLET = 'Multichain wallets are not supported',
  WRONG_WALLET = 'Wrong wallet',
  INVALID_TARGET_ADDRESS = 'Invalid target network address',

  NO_AMOUNT = 'From amount was not entered',
  INSUFFICIENT_FUNDS = 'Insufficient balance',
  LESS_THAN_MINIMUM = 'Entered amount less than minimum',
  MORE_THAN_MAXIMUM = 'Entered amount more than maximum',

  SOL_SWAP = 'Wrap SOL firstly',
  SOLANA_UNAVAILABLE = 'Solana in unavailable',

  NO_SELECTED_TOKEN = 'Select token'
}
