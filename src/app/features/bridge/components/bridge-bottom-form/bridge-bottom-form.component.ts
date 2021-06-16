import { Component } from '@angular/core';

@Component({
  selector: 'app-bridge-bottom-form',
  templateUrl: './bridge-bottom-form.component.html',
  styleUrls: ['./bridge-bottom-form.component.scss']
})
export class BridgeBottomFormComponent {
  public loading: boolean;

  public get allowSwap(): boolean {
    return true;
  }

  constructor() {
    this.loading = false;
  }
}
