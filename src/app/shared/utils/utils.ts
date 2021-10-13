import BigNumber from 'bignumber.js';
import { switchMap } from 'rxjs/operators';
import { of, OperatorFunction } from 'rxjs';

/**
 * Compares two objects for equality.
 * @param object1 First object to compare.
 * @param object2 Second object to compare.
 */
export function compareObjects(object1: object, object2: object): boolean {
  return JSON.stringify(object1) === JSON.stringify(object2);
}

/**
 * Copies object.
 * @param object object to copy.
 */
export function copyObject<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Compares two addresses case insensitive.
 * @param address0 First address.
 * @param address1 Second address.
 */
export function compareAddresses(address0: string, address1: string): boolean {
  return address0.toLowerCase() === address1.toLowerCase();
}

/**
 * Subtracts percent from given amount.
 * @param amount Given amount from which to subtract.
 * @param percent Percent to subtract.
 */
export function subtractPercent(
  amount: number | BigNumber | string,
  percent: number | BigNumber | string
): BigNumber {
  return new BigNumber(amount).multipliedBy(new BigNumber(1).minus(percent));
}

/**
 * Maps stream to void: emits, and completes the stream.
 */
export function mapToVoid(): OperatorFunction<unknown, void> {
  return switchMap(of) as OperatorFunction<unknown, void>;
}
