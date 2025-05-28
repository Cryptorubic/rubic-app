import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mock-rbc',
  templateUrl: './mock-rbc.component.html',
  styleUrls: ['./mock-rbc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MockRbcComponent {}
