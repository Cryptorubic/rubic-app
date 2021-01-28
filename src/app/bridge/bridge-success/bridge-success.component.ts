import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {on} from 'cluster';

@Component({
  selector: 'app-bridge-success',
  templateUrl: './bridge-success.component.html',
  styleUrls: ['./bridge-success.component.scss']
})
export class BridgeSuccessComponent implements OnInit {
  @Input() txId: string;
  @Output() onCloseEvent: EventEmitter<void> = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {
  }

  public onCloseHandler() {
    this.onCloseEvent.emit();
  }

}
