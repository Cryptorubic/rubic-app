import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { TokenInfoBody } from '../../pages/main-page/order-book/types';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Web3PublicService } from '../../services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../services/blockchain/types/Blockchain';

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
  @Input() blockchain: BLOCKCHAIN_NAME;

  @Output() tokenValidated = new EventEmitter<TokenInfoBody>();

  private tokenAddressRegex = /^0x[A-Fa-f0-9]{40}/;

  constructor(private web3: Web3PublicService) {}

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      if (!ctrl.value || !ctrl.value.match(this.tokenAddressRegex)) {
        resolve({ incorrectAddress: true });
        return;
      }

      this.web3[this.blockchain]
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
