export interface Points {
  confirmed: number;
  pending: number;
  requested_to_withdraw?: number;
  withdrawn?: number;
  participant?: boolean;
}
