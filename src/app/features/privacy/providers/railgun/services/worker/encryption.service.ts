import { getRandomBytes, pbkdf2 } from '@railgun-community/wallet';
import { Store } from '@core/services/store/models/store';
import { StoredCreds } from '@features/privacy/providers/railgun/models/encryption-types';

export class EncryptionService {
  // Storage key is intentionally versioned for future migrations
  private readonly storageKey: keyof Store = 'RAILGUN_ENCRYPTION_CREDS_V1';

  // Iterations follow the doc example:
  // - 100k for deriving encryptionKey
  // - 1M for verifying password (stored hash)
  private readonly encryptionKeyIterations = 100_000;

  private readonly storedHashIterations = 1_000_000;

  /**
   * Returns true if credentials exist in storage.
   */
  public hasCreds(storedCreds: string): boolean {
    return !!this.readCredsSafe(storedCreds);
  }

  /**
   * Creates and stores salt + stored password hash.
   * Returns derived encryptionKey (do NOT store it).
   */
  public async setupFromPassword(password: string): Promise<string> {
    const salt = this.generateSaltHex(16);

    const [encryptionKey, passwordHashStored] = await Promise.all([
      this.hashPassword({ secret: password, salt, iterations: this.encryptionKeyIterations }),
      this.hashPassword({ secret: password, salt, iterations: this.storedHashIterations })
    ]);

    const creds: StoredCreds = {
      version: 1,
      salt,
      passwordHashStored,
      createdAt: new Date().toISOString()
    };

    this.saveStoredCreds(JSON.stringify(creds));

    return encryptionKey;
  }

  /**
   * Validates password against stored hash and returns derived encryptionKey.
   * Throws if password is incorrect or creds are missing/corrupted.
   */
  public async unlockFromPassword(password: string, storedCreds: string): Promise<string> {
    const creds = this.readCreds(storedCreds);
    const salt = creds.salt;

    const [encryptionKey, passwordHash] = await Promise.all([
      this.hashPassword({ secret: password, salt, iterations: this.encryptionKeyIterations }),
      this.hashPassword({ secret: password, salt, iterations: this.storedHashIterations })
    ]);

    if (passwordHash !== creds.passwordHashStored) {
      throw new Error('Incorrect password.');
    }

    return encryptionKey;
  }

  /**
   * Optional helper: rotate password (requires old password to prove ownership).
   * Returns new encryptionKey derived from new password.
   */
  public async rotatePassword(
    oldPassword: string,
    newPassword: string,
    storedCreds: string
  ): Promise<string> {
    // Validate old password first (throws if incorrect)
    await this.unlockFromPassword(oldPassword, storedCreds);

    // Re-setup with new password (new salt)
    return this.setupFromPassword(newPassword);
  }

  private async hashPassword(params: {
    secret: string;
    salt: string;
    iterations: number;
  }): Promise<string> {
    // pbkdf2 returns a hex string in the doc examples
    return pbkdf2(params.secret, params.salt, params.iterations);
  }

  private generateSaltHex(bytes: number): string {
    // getRandomBytes is in the doc example; on web it uses secure randomness under the hood
    return getRandomBytes(bytes);
  }

  private readCreds(storedCreds: string): StoredCreds {
    const creds = this.readCredsSafe(storedCreds);
    if (!creds) {
      throw new Error('No stored encryption credentials found.');
    }
    return creds;
  }

  private readCredsSafe(storedCreds: string): StoredCreds | null {
    // const raw = this.storeService.getItem(this.storageKey);
    if (!storedCreds) return null;

    try {
      const parsed = JSON.parse(String(storedCreds)) as StoredCreds;
      if (parsed?.version !== 1 || !parsed?.salt || !parsed?.passwordHashStored) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private saveStoredCreds(creds: string): void {
    postMessage({ method: 'saveCreds', response: { storageKey: this.storageKey, creds: creds } });
  }
}
