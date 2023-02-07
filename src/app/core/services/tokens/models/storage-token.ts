import { Token } from '@shared/models/tokens/token';

export type StorageToken = Omit<Token, 'price'>;
