import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

  public okAction(): void {
    if (this.data.actions && this.data.actions.success) {
      this.data.actions.success();
    }
  }
}
