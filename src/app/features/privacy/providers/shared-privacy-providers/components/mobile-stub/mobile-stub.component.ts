import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-mobile-stub',
  templateUrl: './mobile-stub.component.html',
  styleUrls: ['./mobile-stub.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileStubComponent {}
