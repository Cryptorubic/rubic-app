import { TransactionInterface } from 'node_modules/@cryptorubic/core/src/lib/models/api/transaction.interface';

export function parseExtraFields(
  transaction: TransactionInterface
): { name: string; value: string } | undefined {
  const extraFields = transaction.extraFields as { name?: string; value?: string } | undefined;
  if (!extraFields?.name || !extraFields?.value) {
    return undefined;
  }
  return { name: extraFields.name, value: extraFields.value };
}
