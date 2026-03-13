import { getProver, type SnarkJSGroth16 } from '@railgun-community/wallet';
// @ts-ignore
import { groth16 } from 'snarkjs';
import { OutsideZone } from '@shared/decorators/outside-zone';

export class ProofService {
  /**
   * Call AFTER startRailgunEngine() and BEFORE any private tx proof generation.
   * Safe to call multiple times - will run once.
   */
  @OutsideZone
  public async initProver(): Promise<void> {
    await getProver().setSnarkJSGroth16(groth16 as unknown as SnarkJSGroth16);
  }
}
