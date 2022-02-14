import { BackendToken } from '@core/services/backend/tokens-api/models/tokens';

export type BackendPromoProject = {
  domain: string;
  trade_volume: string;
  update_time: string;
  promoter_comission: string;
  promoter_comission_token: string;
  token: BackendToken;
};

export type ProjectsResponse = BackendPromoProject[];
