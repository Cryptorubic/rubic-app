export interface BackendPagination<T> {
  readonly count: number;
  readonly next: string;
  readonly previous: string;
  readonly results: T[];
}
