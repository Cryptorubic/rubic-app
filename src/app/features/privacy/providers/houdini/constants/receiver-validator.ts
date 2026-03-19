import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { BlockchainName } from '@cryptorubic/core';
import { Web3Pure } from '@cryptorubic/web3';
import { Observable, from, map, of } from 'rxjs';

export const isReceiverCorrect = (blockchain: BlockchainName): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return from(Web3Pure.getInstance(blockchain).isAddressCorrect(control.value)).pipe(
      map(isCorrect => (isCorrect ? null : { incorrectAddress: true }))
    );
  };
};
