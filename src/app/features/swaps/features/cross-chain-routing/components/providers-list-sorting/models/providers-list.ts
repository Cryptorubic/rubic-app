import { Sort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/sort';

export const sorts: ReadonlyArray<Sort> = [
  {
    type: 'smart',
    label: 'Smart sorting',
    description: `Sort by profit, which is calculated as follows:
      The amount of tokens received - gas for transactions and approvals, if necessary - protocol fees - slippage.`
  },
  {
    type: 'maxAmount',
    label: 'Maximum amount',
    description: 'Descr'
  }
];
