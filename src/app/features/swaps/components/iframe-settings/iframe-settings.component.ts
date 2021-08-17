import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-iframe-settings',
  templateUrl: './iframe-settings.component.html',
  styleUrls: ['./iframe-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeSettingsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
