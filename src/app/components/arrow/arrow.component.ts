import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-arrow',
  templateUrl: './arrow.component.html',
  styleUrls: ['./arrow.component.scss']
})
export class ArrowComponent implements OnInit {
  /**
   * arrow direction (top, right, bottom, left)
   */
  @Input() direction: string = 'top';

  /**
   * arrow color
   */
  @Input() color: string = 'black';

  /**
   * arrow size in px
   */
  @Input() size: number = 7;

  public degree: string;

  constructor() {
  }

  ngOnInit() {
    switch (this.direction) {
      case 'top':
        this.degree = '45deg';
        break;
      case 'right':
        this.degree = '135deg';
        break;
      case 'bottom':
        this.degree = '225deg';
        break;
      case 'left':
        this.degree = '315deg';
        break;
    }
  }
}
