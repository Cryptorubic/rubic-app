export interface ApiUserTickets {
  totalBerachellaTickets: number;
  totalSubmittedTickets: number;
}

export interface ApiTicketsStats {
  totalBerachellaTickets: number;
  totalSubmittedTickets: number;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ApiMessageRequest {
  value: number;
  userAddress: string;
}

export interface ApiVerifySignatureRequest {
  message: string;
  signature: string;
}

export interface ApiDiscordSignatureRequest {
  message: string;
  address: string;
  signature: string;
}

export interface ApiDiscordSignatureResponse {
  discordIsReconnected: boolean;
  newAddress: 'string';
  previousAddress: 'string' | null;
  detail?: string;
}

export interface ApiVerifySignatureResponse {
  valid: boolean;
}
