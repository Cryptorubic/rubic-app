interface ProviderData {
  readonly provider_title: string;
  readonly calculation_time_in_seconds: string;
  readonly to_amount: string;
  readonly status: string;
  readonly has_swap_in_source_network: boolean;
  readonly proxy_used: boolean;
  readonly additional_info: string;
}

export interface ProviderStatisctic {
  readonly user: string;
  readonly from_token: string;
  readonly from_network: string;
  readonly from_amount: string;
  readonly to_token: string;
  readonly to_network: string;
  readonly providers_statistics?: ProviderData[];
}
