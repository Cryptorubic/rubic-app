import { Component, Input } from '@angular/core';
import { InputTokenShort } from '../types';

@Component({
  selector: 'app-token-label',
  templateUrl: './token-label.component.html',
  styleUrls: ['./token-label.component.scss']
})
export class TokenLabelComponent {
  @Input() token: InputTokenShort;

  @Input() selected = false;

  constructor() {}
}
