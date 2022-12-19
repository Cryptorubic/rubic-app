import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'functionCall'
})
export class FunctionCallPipe implements PipeTransform {
  public transform<T = unknown>(
    value: unknown,
    handler: (value: unknown) => T,
    context?: unknown
  ): T {
    if (context) {
      return handler.call(context, value);
    }

    return handler(value) as T;
  }
}
