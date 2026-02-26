import { Injectable } from '@angular/core';
import { getProver, type SnarkJSGroth16 } from '@railgun-community/wallet';
// @ts-ignore
import { groth16 } from 'snarkjs';

@Injectable({ providedIn: 'root' })
export class ProofService {
  private initialized = false;

  private initPromise: Promise<void> | null = null;

  /**
   * Call AFTER startRailgunEngine() and BEFORE any private tx proof generation.
   * Safe to call multiple times - will run once.
   */
  public async initProver(): Promise<void> {
    if (this.initialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    await getProver().setSnarkJSGroth16(groth16 as unknown as SnarkJSGroth16);
    this.initialized = true;
  }
}
