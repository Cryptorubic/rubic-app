import { Component, Input } from '@angular/core';
import { NetworkError } from '../../../shared/models/errors/bridge/NetworkError';

@Component({
  selector: 'app-network-error',
  templateUrl: './network-error.component.html',
  styleUrls: ['./network-error.component.scss']
})
export class NetworkErrorComponent {
  @Input() networkError: NetworkError;

  constructor() {}
}
