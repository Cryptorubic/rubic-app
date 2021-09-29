/**
 * Compares two objects for equality.
 * @param object1 First object to compare.
 * @param object2 Second object to compare.
 */
export function compareObjects(object1: object, object2: object): boolean {
  return JSON.stringify(object1) === JSON.stringify(object2);
}

/**
 * Compares two addresses case insensitive.
 * @param address0 First address.
 * @param address1 Second address.
 */
export function compareAddresses(address0: string, address1: string): boolean {
  return address0.toLowerCase() === address1.toLowerCase();
}
