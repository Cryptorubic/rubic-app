import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-rpc-error',
  templateUrl: './rpc-error.component.html',
  styleUrls: ['./rpc-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RpcErrorComponent {
  constructor() {}
}
