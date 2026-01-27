import { inject, Injectable } from '@angular/core';
import { getRandomBytes, pbkdf2 } from '@railgun-community/wallet';
import { StoredCreds } from '@features/privacy/models/encryption-types';
import { StoreService } from '@core/services/store/store.service';
import { Store } from '@core/services/store/models/store';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  // Storage key is intentionally versioned for future migrations
  private readonly storageKey: keyof Store = 'RAILGUN_ENCRYPTION_CREDS_V1';

  // Iterations follow the doc example:
  // - 100k for deriving encryptionKey
  // - 1M for verifying password (stored hash)
  private readonly encryptionKeyIterations = 100_000;

  private readonly storedHashIterations = 1_000_000;

  private readonly storeService = inject(StoreService);

  /**
   * Returns true if credentials exist in storage.
   */
  public hasCreds(): boolean {
    return !!this.readCredsSafe();
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

    this.storeService.setItem(this.storageKey, JSON.stringify(creds));
    return encryptionKey;
  }

  /**
   * Validates password against stored hash and returns derived encryptionKey.
   * Throws if password is incorrect or creds are missing/corrupted.
   */
  public async unlockFromPassword(password: string): Promise<string> {
    const creds = this.readCreds();
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
   * Deletes stored creds (user will lose access unless they remember/export mnemonic elsewhere).
   */
  public clear(): void {
    this.storeService.deleteItem(this.storageKey);
  }

  /**
   * Optional helper: rotate password (requires old password to prove ownership).
   * Returns new encryptionKey derived from new password.
   */
  public async rotatePassword(oldPassword: string, newPassword: string): Promise<string> {
    // Validate old password first (throws if incorrect)
    await this.unlockFromPassword(oldPassword);

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

  private readCreds(): StoredCreds {
    const creds = this.readCredsSafe();
    if (!creds) {
      throw new Error('No stored encryption credentials found.');
    }
    return creds;
  }

  private readCredsSafe(): StoredCreds | null {
    const raw = this.storeService.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(String(raw)) as StoredCreds;
      if (parsed?.version !== 1 || !parsed?.salt || !parsed?.passwordHashStored) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
