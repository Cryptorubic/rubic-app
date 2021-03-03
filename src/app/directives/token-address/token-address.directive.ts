import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { BLOCKCHAIN_NAMES } from '../../pages/main-page/trades-form/types';
import { TokenInfoBody } from '../../services/blockchain/web3PrivateService/types';
import { Web3ApiService } from '../../services/blockchain/web3PrivateService/web3-api.service';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appTokenAddress]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: TokenAddressDirective,
      multi: true
    }
  ]
})
export class TokenAddressDirective {
  @Input() blockchain: BLOCKCHAIN_NAMES;

  @Output() tokenValidated = new EventEmitter<TokenInfoBody>();

  private tokenAddressRegex = /^0x[A-Fa-f0-9]{40}/;

  constructor(private web3Service: Web3ApiService) {}

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      if (!ctrl.value || !ctrl.value.match(this.tokenAddressRegex)) {
        resolve({ incorrectAddress: true });
        return;
      }

      this.web3Service
        .getTokenInfo(ctrl.value, this.blockchain)
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
