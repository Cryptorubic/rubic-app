import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressComponent implements OnInit {
  @Input() size: number;

  @Input() label: string;

  @Input() value: number;

  @Input() loading: boolean = true;

  @Input() needLogin: boolean = false;

  constructor() {}

  ngOnInit(): void {
    return undefined;
  }
}
