import { ArtifactStore, POIList } from '@railgun-community/wallet';

export interface RailgunEngineInitArgs {
  /**
   * Name for your wallet implementation.
   * Max 16 chars, lowercase (RAILGUN requirement).
   */
  walletSource?: string;

  /**
   * LevelDOWN compatible database instance (Node) or DB adapter (Web).
   */
  db: unknown;

  /**
   * Artifact store instance (your persistent store).
   */
  artifactStore: ArtifactStore;

  /**
   * Whether to forward Engine debug logs to Logger.
   */
  shouldDebug?: boolean;

  /**
   * True for mobile native artifacts. False for nodejs/browser wasm artifacts.
   */
  useNativeArtifacts?: boolean;

  /**
   * If true, skips merkletree syncs and private balance scans.
   * Use only for shield-only flows.
   */
  skipMerkletreeScans?: boolean;

  /**
   * Private POI aggregator nodes, in priority order.
   */
  poiNodeURLs?: string[];

  /**
   * Custom POI lists. Empty = default list on aggregator.
   */
  customPOILists?: POIList[];

  /**
   * Verbose logs for private balance and TXID scans.
   */
  verboseScanLogging?: boolean;

  /**
   * Attach SIGINT handler (Node only). Default true.
   */
  handleSigint?: boolean;
}
