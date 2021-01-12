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

  @Output() click = new EventEmitter<void>();

  onClick() {
    this.click.emit();
  }

  constructor() { }

  ngOnInit() {
  }

}
