import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-linked-account-error',
  templateUrl: './no-linked-account-error.component.html',
  styleUrls: ['./no-linked-account-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoLinkedAccountErrorComponent {}
