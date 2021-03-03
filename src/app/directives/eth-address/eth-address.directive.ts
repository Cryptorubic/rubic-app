import { Directive, ElementRef, Input } from '@angular/core';
import { Web3ServiceLEGACY } from '../../services/web3LEGACY/web3LEGACY.service';

@Directive({
  selector: '[appEthAddress]'
})
export class EthAddressDirective {
  @Input('appEthAddress') private appEthAddress: string;

  constructor(element: ElementRef) {
    // console.log(element, this.appEthAddress);
  }
}
