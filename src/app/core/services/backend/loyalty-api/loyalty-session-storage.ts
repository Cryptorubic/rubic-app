import { inject, Injectable } from '@angular/core';
import { WA_LOCAL_STORAGE } from '@ng-web-apis/common';

const STORAGE_KEY = 'RUBIC_LOYALTY_SESSION';

@Injectable({ providedIn: 'root' })
export class LoyaltySessionStorage {
  private readonly localStorage = inject(WA_LOCAL_STORAGE);

  public get(address: string): string | null {
    return this.read()[this.key(address)] ?? null;
  }

  public set(address: string, token: string): void {
    const sessions = this.read();
    sessions[this.key(address)] = token;
    this.write(sessions);
  }

  public delete(address: string): void {
    const sessions = this.read();
    delete sessions[this.key(address)];
    this.write(sessions);
  }

  private key(address: string): string {
    return address.toLowerCase();
  }

  private read(): Record<string, string> {
    try {
      const raw = this.localStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        return {};
      }

      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }

      return parsed as Record<string, string>;
    } catch {
      return {};
    }
  }

  private write(sessions: Record<string, string>): void {
    try {
      this.localStorage?.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      return;
    }
  }
}
