export interface ChartInfo {
  size: ChartSize;
  status: ChartStatus;
}

export interface ChartSize {
  height: number;
  width: number;
}

export interface ChartStatus {
  loaded: boolean;
  opened: boolean;
  lastOpened: boolean;
  forceClosed: boolean;
}
