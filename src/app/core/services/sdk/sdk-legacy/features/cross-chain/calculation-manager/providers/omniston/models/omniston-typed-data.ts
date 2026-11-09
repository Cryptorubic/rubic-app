export interface OmnistonTypedData {
  domain: Record<string, unknown>;
  types: Record<string, { name: string; type: string }[]>;
  message: Record<string, unknown>;
  primaryType: string;
}

export interface OmnistonSignedOrderTransaction {
  typedData?: OmnistonTypedData;
  exchangeId?: string;
}
