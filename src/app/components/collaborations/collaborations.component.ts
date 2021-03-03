import { Component } from '@angular/core';

// @ts-ignore
import collaborations from '../../../assets/content/collaborations/collaborations.json';

@Component({
  selector: 'app-collaborations',
  templateUrl: './collaborations.component.html',
  styleUrls: ['./collaborations.component.scss']
})
export class CollaborationsComponent {
  public collaborations = collaborations;

  constructor() {}
}
