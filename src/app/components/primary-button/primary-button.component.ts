import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-primary-button',
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss']
})
export class PrimaryButtonComponent implements OnInit {
  @Input() animate?: boolean = false;
  @Input() label: string;
  @Input() className?: string = "";
  @Input() disabled?: boolean = false;

  @Output() onClick = new EventEmitter<void>();

  onClickHandler() {
    this.onClick.emit();
  }

  constructor() { }

  ngOnInit() {
  }

}
