import { Injectable } from '@angular/core';
// @ts-ignore
import LevelDB from 'level-js';

@Injectable({
  providedIn: 'root'
})
export class LevelDownService {
  constructor() {}

  public createIndexDB(): LevelDB {
    const db = LevelDB('./data/mydb');
    return db;
  }
}
