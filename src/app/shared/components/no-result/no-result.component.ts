import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-result',
  templateUrl: './no-result.component.html',
  styleUrls: ['./no-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoResultComponent {
  @Input({ required: true }) label: string;

  @Input({ required: true }) description: string;
}
