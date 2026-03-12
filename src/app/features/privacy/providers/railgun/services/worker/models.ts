export interface RailgunRequest<T extends unknown> {
  method: string;
  params: T;
}

export interface RailgunSuccessResponse<T extends unknown> {
  method: string;
  response: T;
}

export interface RailgunErrorResponse {
  method: string;
  error: string;
}

export type RailgunResponse<T> = RailgunSuccessResponse<T> | RailgunErrorResponse;
