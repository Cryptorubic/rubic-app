import { Component, OnInit } from '@angular/core';

// @ts-ignore
import collaborations from '../../assets/content/collaborations/collaborations.json';

@Component({
  selector: 'app-bridge',
  templateUrl: './bridge.component.html',
  styleUrls: ['./bridge.component.scss']
})
export class BridgeComponent implements OnInit {

  collaborations = collaborations;

  constructor() { }

  ngOnInit() {
  }

}
