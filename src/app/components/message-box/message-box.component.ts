import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {
  @Input() title: string;
  @Input() description: string;
  @Input() additionalDescription?: string;
  
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }
  
  constructor() { }

  ngOnInit() {
  }

}
