import { UniqueProviderInfoInterface } from 'node_modules/@cryptorubic/core/src/lib/models/api/unique-provider-info.interface';

export function getUniqueProviderId(uniqueInfo?: UniqueProviderInfoInterface): string | null {
  const { additionalData: _, ...ids } = uniqueInfo || {};
  return Object.values(ids)[0] || null;
}
