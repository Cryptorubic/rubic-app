export type TradePointsStatus = 'processing' | 'pending' | 'confirmed' | 'rejected';

export interface TradePoints {
  pointsStatus: TradePointsStatus;
  points: number;
}
