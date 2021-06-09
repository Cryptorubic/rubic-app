import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonCircleSize } from 'src/app/shared/models/components/button-circle';

@Component({
  selector: 'app-rubic-button-circle',
  templateUrl: './rubic-button-circle.component.html',
  styleUrls: ['./rubic-button-circle.component.scss']
})
export class RubicButtonCircleComponent implements OnInit {
  @Input() size: ButtonCircleSize;

  @Input() altText: string;

  @Input() icon: string;

  @Input() disabled: boolean;

  @Output() onClick: EventEmitter<Event> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    console.log(this.icon);
  }
}
