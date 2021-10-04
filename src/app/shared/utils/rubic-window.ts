import Process = NodeJS.Process; // Included with Angular CLI.

/**
 * APPLICATION IMPORTS
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface RubicWindow extends Window {
  global?: unknown;
  process?: Process;
  Buffer?: Buffer;
  dataLayer?: unknown[];
}
