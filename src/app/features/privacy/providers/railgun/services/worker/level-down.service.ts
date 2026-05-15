// @ts-ignore
import LevelDB from 'level-js';

export class LevelDownService {
  public createIndexDB(): LevelDB {
    const db = LevelDB('./data/mydb');
    return db;
  }
}
