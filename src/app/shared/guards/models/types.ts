import { Observable } from 'rxjs';
import { UrlTree } from '@angular/router';

export type ActivationResult =
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree;

export type LoadResult =
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree;
