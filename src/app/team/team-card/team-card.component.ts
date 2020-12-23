import {Component, Input, OnInit} from '@angular/core';

interface ICardLink {
  icon: string,
  url: string
}

export interface ICardContent {
  img: string,
  name: string,
  role: string,
  links: Array<ICardLink>
}


@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss']
})
export class TeamCardComponent implements OnInit {

  @Input() content: ICardContent;

  constructor() { }

  ngOnInit() {
  }

  onClick(){
    window.open(this.content.links[0].url, "_blank");
  }

}
