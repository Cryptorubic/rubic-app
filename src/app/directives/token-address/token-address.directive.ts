import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { BLOCKCHAIN_NAMES } from '../../pages/main-page/trades-form/types';
import { TokenInfoBody } from '../../services/web3Api/types';
import { Web3ApiService } from '../../services/web3Api/web3-api.service';

@Directive({
  selector: '[appTokenAddress]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: TokenAddressDirective,
      multi: true
    }
  ]
})
export class TokenAddressDirective {
  @Input() blockchain: BLOCKCHAIN_NAMES;

  @Output() tokenValidated = new EventEmitter<TokenInfoBody>();

  private readonly tokenAddressRegex = /^0x[A-Fa-f0-9]{40}$/;

  constructor(private web3Service: Web3ApiService) {}

  validate(control: AbstractControl): Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      if (!control.value || !control.value.match(this.tokenAddressRegex)) {
        resolve({ incorrectAddress: true });
        return;
      }

      this.web3Service
        .getTokenInfo(control.value, this.blockchain)
        .then((token: TokenInfoBody) => {
          this.tokenValidated.emit(token);
          resolve(null);
        })
        .catch(err => {
          console.log(err);
          resolve({ tokenInfoError: err });
        });
    });
  }
}
