import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapForm } from 'src/app/shared/models/swaps/ISwapForm';

export interface FormService {
  commonTrade: FormGroup<ISwapForm>;
}
