export interface AirdropUserPointsInfo {
  confirmed: number;
  pending: number;
  requested_to_withdraw?: number;
  withdrawn?: number;
  participant?: boolean;
}

export interface AirdropUserClaimInfo {
  round: number;
  is_participant: boolean;
  address: string;
  index: number;
  amount: string;
  proof: string[];
}
