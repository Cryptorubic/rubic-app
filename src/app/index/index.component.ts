import { Component, OnInit } from '@angular/core';
import PROJECTS from './projects-resourses';
import { HttpService } from '../services/http/http.service';

const STAT_URL = 'get_statistics_landing/';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  public projects = PROJECTS;
  public stat;
  constructor(
    private httpService: HttpService
  ) { }

  ngOnInit() {
    this.httpService.get(STAT_URL).subscribe(res => this.stat = res);
  }

}
