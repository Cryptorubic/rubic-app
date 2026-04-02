export interface RailgunRequest<T extends unknown> {
  method: string;
  params: T;
  id: number;
}

export interface RailgunSuccessResponse<T extends unknown> {
  method: string;
  response: T;
  id?: number;
}

export interface RailgunErrorResponse {
  method: string;
  error: string;
  id?: number;
}

export type RailgunResponse<T> = RailgunSuccessResponse<T> | RailgunErrorResponse;
