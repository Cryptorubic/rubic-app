interface ProviderData {
  readonly provider_title: string;
  readonly calculation_time_in_seconds: string;
  readonly to_amount: string;
  readonly status: string;
  readonly proxy_used: boolean;
  readonly additional_info: string;
  readonly has_swap_in_source_network: boolean;
}

interface ProviderStatistic<T> {
  readonly user: string;
  readonly from_token: string;
  readonly from_network: string;
  readonly from_amount: string;
  readonly to_token: string;
  readonly to_network: string;
  readonly providers_statistics?: T[];
}

export type ProviderCcrStatistic = ProviderStatistic<ProviderData>;

export type ProviderOnChainStatistic = Omit<
  ProviderStatistic<Omit<ProviderData, 'has_swap_in_source_network'>>,
  'from_network' | 'to_network'
> & { network: string };
