export class Utils {
  /**
   * Compare two objects for equality.
   * @param object1 First object to compare.
   * @param object2 Second object to compare.
   */
  static compareObjects(object1: object, object2: object): boolean {
    return JSON.stringify(object1) === JSON.stringify(object2);
  }

  /**
   * Compare two addresses case insensitive.
   * @param address0 First address.
   * @param address1 Second address.
   */
  static compareAddresses(address0: string, address1: string): boolean {
    return address0.toLowerCase() === address1.toLowerCase();
  }
}
