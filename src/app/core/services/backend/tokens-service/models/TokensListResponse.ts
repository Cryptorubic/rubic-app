import { BackendToken } from './BackendToken';

export interface TokensListResponse {
  total: number;
  tokens: BackendToken[];
}
