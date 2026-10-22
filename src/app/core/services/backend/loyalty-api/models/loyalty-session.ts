export interface SessionMessageRequest {
  userAddress: string;
  domain: string;
}

export interface SessionCreateRequest {
  userAddress: string;
  message: string;
  signature: string;
}

export interface SessionCreateResponse {
  token: string;
  userAddress: string;
  expiresAt: string;
}
