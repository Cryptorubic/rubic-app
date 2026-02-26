import { Injectable } from '@angular/core';
import { RailgunEngineInitArgs } from '@features/privacy/providers/railgun/models/railgun-engine-init-args';
import { loadProvider, startRailgunEngine, stopRailgunEngine } from '@railgun-community/wallet';
import {
  FallbackProviderJsonConfig,
  ProviderJson
} from '@railgun-community/shared-models/dist/utils/fallback-provider';
import {
  fromPrivateToRubicChainMap,
  fromRubicToPrivateChainMap
} from '@features/privacy/providers/railgun/constants/network-map';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { blockchainId, EvmBlockchainName } from '@cryptorubic/core';
import initPoseidonWasm from '@railgun-community/poseidon-hash-wasm';

@Injectable({
  providedIn: 'root'
})
export class RailgunEngineService {
  private started = false;

  private startingPromise: Promise<void> | null = null;

  /**
   * Start the engine (idempotent).
   * - If called twice concurrently, second call waits for the first.
   * - If already started, returns immediately.
   */
  public async start(args: RailgunEngineInitArgs): Promise<void> {
    if (this.started) return;
    if (this.startingPromise) return this.startingPromise;

    this.startingPromise = this.startInternal(args);
    try {
      await this.startingPromise;
      this.started = true;
    } finally {
      this.startingPromise = null;
    }
  }

  /**
   * Stop the engine (idempotent).
   */
  public async stop(): Promise<void> {
    // If start is in-flight, wait for it to finish then stop.
    if (this.startingPromise) {
      await this.startingPromise.catch(() => undefined);
    }

    if (!this.started) return;

    await stopRailgunEngine();
    this.started = false;
  }

  public isStarted(): boolean {
    return this.started;
  }

  private async startInternal(args: RailgunEngineInitArgs): Promise<void> {
    const walletSource = this.normalizeWalletSource(args.walletSource ?? 'quickstartdemo');

    const shouldDebug = args.shouldDebug ?? true;
    const useNativeArtifacts = args.useNativeArtifacts ?? false;
    const skipMerkletreeScans = args.skipMerkletreeScans ?? false;

    const poiNodeURLs = args.poiNodeURLs ?? ['https://ppoi-agg.horsewithsixlegs.xyz'];

    const customPOILists = args.customPOILists ?? [];
    const verboseScanLogging = args.verboseScanLogging ?? true;

    // Minimal input guards (keep it strict but not annoying)
    if (!args.db) {
      throw new Error('RailgunEngineService: "db" is required');
    }
    if (!args.artifactStore) {
      throw new Error('RailgunEngineService: "artifactStore" is required');
    }
    if (!Array.isArray(poiNodeURLs) || poiNodeURLs.length === 0) {
      throw new Error('RailgunEngineService: "poiNodeURLs" must be non-empty');
    }

    await startRailgunEngine(
      walletSource,
      args.db,
      shouldDebug,
      args.artifactStore,
      useNativeArtifacts,
      skipMerkletreeScans,
      poiNodeURLs,
      customPOILists,
      verboseScanLogging
    );
  }

  public async loadEngineProvider(): Promise<void> {
    const loadPromises = Object.values(fromPrivateToRubicChainMap).map(
      (network: EvmBlockchainName) => {
        const chainId = blockchainId[network];
        const chainRpc = rpcList[network][0];
        const chain = fromRubicToPrivateChainMap[network];

        const JSONProvider: FallbackProviderJsonConfig = {
          chainId,
          providers: [this.getProviderInfo(chainRpc)]
        };
        const pollingInterval = 1000 * 60 * 5; // 5 min

        return loadProvider(JSONProvider, chain, pollingInterval);
      }
    );
    await Promise.all(loadPromises);
  }

  private normalizeWalletSource(input: string): string {
    // RAILGUN: max 16 chars, lowercase. Also avoid spaces for sanity.
    const normalized = input.trim().toLowerCase().replace(/\s+/g, '');
    if (normalized.length === 0) return 'quickstartdemo';
    return normalized.slice(0, 16);
  }

  private getProviderInfo(providerUrl: string): ProviderJson {
    return {
      provider: providerUrl,
      priority: 3,
      weight: 2,
      maxLogsPerBatch: 1
    };
  }

  public async initPoseidonWasm(): Promise<void> {
    // @ts-ignore
    await initPoseidonWasm('/assets/railgun/poseidon_hash_wasm_bg.wasm');
  }
}
