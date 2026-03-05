export interface RailgunRequest<T extends unknown> {
  method: string;
  params: T;
}

export interface RailgunResponse<T extends unknown> {
  method: string;
  response: T;
}
