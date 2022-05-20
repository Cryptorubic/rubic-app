import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialsComponent {
  constructor() {}
}
