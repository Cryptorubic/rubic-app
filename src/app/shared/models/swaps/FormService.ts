import { FormGroup } from '@ngneat/reactive-forms';
import { ISwapForm, ISwapFormInput, ISwapFormOutput } from 'src/app/shared/models/swaps/ISwapForm';
import { Observable } from 'rxjs';

export interface FormService {
  commonTrade: FormGroup<ISwapForm>;

  get input(): FormGroup<ISwapFormInput>;
  get inputValue(): ISwapFormInput;
  get inputValueChanges(): Observable<ISwapFormInput>;

  get output(): FormGroup<ISwapFormOutput>;
  get outputValue(): ISwapFormOutput;
  get outputValueChanges(): Observable<ISwapFormOutput>;
}
