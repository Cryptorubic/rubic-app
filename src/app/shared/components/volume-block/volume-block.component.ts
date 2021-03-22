import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-volume-block',
  templateUrl: './volume-block.component.html',
  styleUrls: ['./volume-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolumeBlockComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
