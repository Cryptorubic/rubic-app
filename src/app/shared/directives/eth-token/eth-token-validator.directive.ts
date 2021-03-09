import { Directive, Output, Input } from '@angular/core';
import {
  NG_ASYNC_VALIDATORS,
  AsyncValidator,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import * as EventEmitter from 'events';
import { Observable } from 'rxjs';
import { Web3Service } from 'src/app/core/services/web3/web3.service';

@Directive({
  selector: '[appEthTokenValidator]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: EthTokenValidatorDirective,
      multi: true
    }
  ]
})
export class EthTokenValidatorDirective implements AsyncValidator {
  @Output() TokenResolve = new EventEmitter();

  @Input() network;

  constructor(private web3Service: Web3Service) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.web3Service.getFullTokenInfo(ctrl.value, this.network).then(
      (result: any) => {
        if (result && result.token_short_title) {
          this.TokenResolve.emit(result);
          return null;
        }
        return {
          token: true
        };
      },
      () => {
        return {
          token: true
        };
      }
    );
  }
}
