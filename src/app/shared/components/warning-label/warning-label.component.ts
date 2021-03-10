import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-warning-label',
  templateUrl: './warning-label.component.html',
  styleUrls: ['./warning-label.component.scss']
})
export class WarningLabelComponent implements OnInit {
  @Input() warningText: string;
  constructor() {}

  ngOnInit() {}
}
