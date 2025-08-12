import { Injectable } from '@angular/core';
import { Observable, shareReplay, startWith, switchMap, timer } from 'rxjs';
import { ApiBanner } from '../models/banners';
import { HttpService } from '@app/core/services/http/http.service';
import { shareReplayConfig } from '@app/shared/constants/common/share-replay-config';

// refetch banners every 10 minutes
const REFETCH_AFTER = 60 * 10 * 1_000;

@Injectable()
export class BannersService {
  public readonly banners$: Observable<ApiBanner[]> = timer(0, REFETCH_AFTER).pipe(
    switchMap(() => this.httpService.get<ApiBanner[]>('v2/info/banners')),
    shareReplay(shareReplayConfig),
    startWith([])
  );

  constructor(private readonly httpService: HttpService) {}
}
