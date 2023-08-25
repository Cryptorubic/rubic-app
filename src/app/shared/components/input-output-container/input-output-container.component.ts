import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-input-output-container',
  templateUrl: './input-output-container.component.html',
  styleUrls: ['./input-output-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputOutputContainerComponent {}
