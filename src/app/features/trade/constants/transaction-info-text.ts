export const transactionInfoText = {
  protocolFee: {
    label: 'Protocol fee',
    description: 'Rubic protocol commission fee'
  },
  networkFee: {
    label: 'Network fee',
    description: 'Provider fee to proceed swap in target network'
  },
  priceImpact: {
    label: 'Price impact',
    description:
      'Correlation between an incoming order and the change in the price of the asset involved caused by the trade'
  },
  slippage: {
    label: 'Slippage',
    description:
      'Your transaction will be canceled if the price changes unfavorably by more than the entered percentage (a lower percentage decreases the chances of your transaction being front-run)'
  },
  rate: {
    label: 'Rate',
    description: ''
  },
  route: {
    label: 'Route',
    description: ''
  },
  receiver: {
    label: 'Receiver address',
    description: 'Address to send assets'
  },
  minReceived: {
    label: 'Minimum Received',
    description:
      'Minimum amount of tokens you will receive in target blockchain. Depends on slippage'
  },
  gaslessSolana: {
    label: 'Gasless',
    description:
      'Gasless? Yep. On Solana, Rubic pays your gas fees for 5 swaps over $100 every day!'
  }
} as const;
