import { Component, OnInit } from '@angular/core';
import {ICardContent} from './team-card/team-card.component';
// @ts-ignore
import team from "../../assets/content/team/team.json";

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  cards: Array<ICardContent> = team;

  constructor() { }

  ngOnInit() {
  }

}
