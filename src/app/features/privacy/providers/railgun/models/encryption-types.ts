export type HashRecord = {
  secret: string; // pbkdf2 result (hex string)
  salt: string; // hex string
  iterations: number;
};

export type StoredCreds = {
  version: 1;
  salt: string; // hex
  passwordHashStored: string; // hex (pbkdf2 with high iterations)
  createdAt: string; // ISO
};
