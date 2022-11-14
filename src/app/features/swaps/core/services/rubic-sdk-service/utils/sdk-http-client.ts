import { HttpClient } from '@angular/common/http';

export class SdkHttpClient {
  constructor(private readonly httpClient: HttpClient) {}

  public post<ResponseBody>(
    url: string,
    body: Object,
    headers?: Record<string, string | string[]>
  ): Promise<ResponseBody> {
    return this.httpClient.post<ResponseBody>(url, body, { headers }).toPromise();
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
    return this.httpClient.get<ResponseBody>(url, options).toPromise();
  }
}
