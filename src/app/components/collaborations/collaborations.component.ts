import { Component, OnInit } from '@angular/core';

// @ts-ignore
import collaborations from '../../../assets/content/collaborations/collaborations.json';

@Component({
  selector: 'app-collaborations',
  templateUrl: './collaborations.component.html',
  styleUrls: ['./collaborations.component.scss']
})
export class CollaborationsComponent implements OnInit {

  public collaborations = collaborations;

  constructor() { }

  ngOnInit() {
  }

}
