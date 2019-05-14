import {Directive, ElementRef, Input} from '@angular/core';
import { Web3Service } from '../../services/web3/web3.service';

@Directive({
  selector: '[appEthAddress]'
})
export class EthAddressDirective {

  @Input('appEthAddress') private appEthAddress: string;

  constructor(
    element: ElementRef
  ) {
    // console.log(element, this.appEthAddress);
  }

}
