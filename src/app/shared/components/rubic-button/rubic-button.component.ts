import { Component, Input, OnInit } from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiSizeXL, TuiSizeXS } from '@taiga-ui/core/types';

@Component({
  selector: 'app-rubic-button',
  templateUrl: './rubic-button.component.html',
  styleUrls: ['./rubic-button.component.scss']
})
export class RubicButtonComponent implements OnInit {
  @Input() buttonText: string;

  @Input() disabled: boolean = false;

  @Input() appearance: TuiAppearance | string = 'primary';

  @Input() size: TuiSizeXS | TuiSizeXL = 'l';

  @Input() iconUrl: string;

  @Input() altText: string;

  constructor() {}

  ngOnInit(): void {
    console.log(this.size);
  }
}
