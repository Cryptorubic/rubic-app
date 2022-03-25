import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'functionCall'
})
export class FunctionCallPipe implements PipeTransform {
  public transform(
    value: unknown,
    handler: (value: unknown) => unknown,
    context?: unknown
  ): unknown {
    if (context) {
      return handler.call(context, value);
    }

    return handler(value);
  }
}
