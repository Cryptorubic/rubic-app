import { Component, OnInit } from '@angular/core';
import PROJECTS from "./projects-resourses";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  public projects = PROJECTS;
  constructor() { }

  ngOnInit() {
  }

}
