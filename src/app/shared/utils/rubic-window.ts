import Process = NodeJS.Process;
// Included with Angular CLI.

/**
 * APPLICATION IMPORTS
 */
export interface RubicWindow extends Window {
  global?: unknown;
  process?: Process;
  Buffer?: Buffer;
  dataLayer?: unknown[];
  ga?: Function | { create: Function; loaded: boolean };
  chrome?: boolean;
  tronLink?: {
    tronWeb: unknown;
  };
}
