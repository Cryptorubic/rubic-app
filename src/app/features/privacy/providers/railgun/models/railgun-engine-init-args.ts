import { ArtifactStore } from '@railgun-community/wallet';

export interface RailgunEngineInitArgs {
  /**
   * LevelDOWN compatible database instance (Node) or DB adapter (Web).
   */
  db: unknown;

  /**
   * Artifact store instance (your persistent store).
   */
  artifactStore: ArtifactStore;
}
