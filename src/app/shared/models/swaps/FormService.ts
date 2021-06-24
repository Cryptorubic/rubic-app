import { FormGroup } from '@ngneat/reactive-forms';
import { SwapForm } from 'src/app/features/swaps/models/SwapForm';

export interface FormService {
  commonTrade: FormGroup<SwapForm>;
}
