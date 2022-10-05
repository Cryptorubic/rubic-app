import { Sort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/sort';

export const sorts: ReadonlyArray<Sort> = [
  {
    type: 'smart',
    label: 'Smart sorting',
    description: `Swap route is being sort by the profit and calculated using this structure: 
The amount of tokens received - gas for transactions, if necessary - protocol fees.`
  },
  {
    type: 'maxAmount',
    label: 'Maximum amount',
    description:
      'Swap route is being sort by the maximum profit, not taking into the account commissions and Gas Price.'
  }
];
