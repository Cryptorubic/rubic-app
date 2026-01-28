import { inject, Injectable } from '@angular/core';
import { RailgunEngineService } from '@features/privacy/services/railgun-engine/railgun-engine.service';
import { BalanceControllerService } from '@features/privacy/services/balance-controller/balance-controller.service';
import { BroadcasterService } from '@features/privacy/services/broadcaster/broadcaster.service';
import { ProofService } from '@features/privacy/services/proof/proof.service';
import { LevelDownService } from '@features/privacy/services/level-down/level-down.service';
import { ArtifactStoreService } from '@features/privacy/services/artifact-store/artifact-store.service';

@Injectable({
  providedIn: 'root'
})
export class RailgunService {
  private readonly railgunEngineService = inject(RailgunEngineService);

  private readonly balanceControllerService = inject(BalanceControllerService);

  private readonly broadcasterService = inject(BroadcasterService);

  private readonly proofService = inject(ProofService);

  private readonly dbService = inject(LevelDownService);

  private readonly artifactStoreService = inject(ArtifactStoreService);

  public async initServices(): Promise<void> {
    // console.log('[RAILGUN] Initializing Poseidon WASM...');
    // await this.railgunEngineService.initPoseidonWasm();
    // await waitFor(10_000);
    // console.log('[RAILGUN] Poseidon WASM initialized');

    const db = this.dbService.createIndexDB();
    const artifactStore = this.artifactStoreService.createArtifactStore();

    console.log('[RAILGUN] Initializing Railgun Engine...');
    await this.railgunEngineService.start({ db, artifactStore });
    console.log('[RAILGUN] Railgun Engine initialized');

    console.log('[RAILGUN] Setting up balance callbacks...');
    this.balanceControllerService.installCallbacks();
    console.log('[RAILGUN] Balance callbacks set up');

    console.log('[RAILGUN] Loading Engine Provider...');
    await this.railgunEngineService.loadEngineProvider();
    console.log('[RAILGUN] Engine Provider loaded');

    console.log('[RAILGUN] Initializing Broadcaster for polygon...');
    await this.broadcasterService.initBroadcaster({ type: 0, id: 137 });
    console.log('[RAILGUN] Broadcaster  for polygon initialized');

    console.log('[RAILGUN] Setting up Node Groth16...');
    await this.proofService.initProver();
    console.log('[RAILGUN] Node Groth16 setup complete');
  }
}
