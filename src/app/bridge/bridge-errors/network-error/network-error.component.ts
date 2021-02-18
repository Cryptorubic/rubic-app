import { Component, Input, OnInit } from '@angular/core';
import { NetworkError } from '../../../errors/bridge/NetworkError';

@Component({
  selector: 'app-network-error',
  templateUrl: './network-error.component.html',
  styleUrls: ['./network-error.component.scss']
})
export class NetworkErrorComponent implements OnInit {
  @Input() networkError: NetworkError;

  constructor() {}

  ngOnInit() {}
}
