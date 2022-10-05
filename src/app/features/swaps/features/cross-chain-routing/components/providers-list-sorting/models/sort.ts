import { ProvidersSort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/providers-sort';

export interface Sort {
  type: ProvidersSort;
  label: string;
  description: string;
}
