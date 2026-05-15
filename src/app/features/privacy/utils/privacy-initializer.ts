import { PrivateLocalStorageService } from '../services/privacy-local-storage.service';

export function privacyInitializer(
  privateLocalStorage: PrivateLocalStorageService
): () => Promise<void> {
  return () => privateLocalStorage.initStorage();
}
