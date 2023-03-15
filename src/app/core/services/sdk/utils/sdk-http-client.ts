import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export class SdkHttpClient {
  constructor(private readonly httpClient: HttpClient) {}

  public post<ResponseBody>(
    url: string,
    body: Object,
    options?: {
      headers?: {
        [header: string]: string;
      };
    }
  ): Promise<ResponseBody> {
    return firstValueFrom(this.httpClient.post<ResponseBody>(url, body, options));
  }

  public get<ResponseBody>(
    url: string,
    options?: {
      headers?: {
        [header: string]: string;
      };
      params?: {
        [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
      };
    }
  ): Promise<ResponseBody> {
    return firstValueFrom(this.httpClient.get<ResponseBody>(url, options));
  }
}
