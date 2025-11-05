import { Token } from '@cryptorubic/core';
import { RubicSdkError } from '@cryptorubic/web3';

export function createTokenNativeAddressProxy<T extends Token>(
  token: T,
  wrappedNativeAddress: string,
  useLowerCase = true
): T {
  const wethAbleAddress = token.isNative ? wrappedNativeAddress : token.address;
  return new Proxy<T>(token, {
    get: (target, key) => {
      if (!(key in target)) {
        return undefined;
      }
      if (key === 'address') {
        return useLowerCase ? wethAbleAddress.toLowerCase() : wethAbleAddress;
      }
      return target[key as keyof T];
    }
  });
}

export function createTokenNativeAddressProxyInPathStartAndEnd<T extends Token>(
  path: T[] | ReadonlyArray<T>,
  wrappedNativeAddress: string
): ReadonlyArray<T> {
  if (!path?.[0]) {
    throw new RubicSdkError('Path cannot be empty');
  }
  const token = path[path.length - 1];
  if (!token) {
    throw new RubicSdkError("Path's tokens has to be defined");
  }

  return [createTokenNativeAddressProxy(path[0], wrappedNativeAddress)]
    .concat(path.slice(1, path.length - 1))
    .concat(createTokenNativeAddressProxy(token, wrappedNativeAddress));
}
