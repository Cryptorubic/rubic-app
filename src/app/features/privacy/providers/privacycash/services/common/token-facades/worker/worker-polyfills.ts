/**
 * Polyfills for Web Worker context.
 * Must be imported FIRST in the worker entry file so that
 * `process` is available before any library code is evaluated.
 */

import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

/* eslint-disable @typescript-eslint/no-explicit-any */
const _self = self as any;

if (typeof _self.process === 'undefined') {
  _self.process = {
    env: {},
    version: '',
    nextTick: (fn: () => void) => setTimeout(fn, 0),
    browser: true
  };
}
(self as RubicAny).window = self;
(self as RubicAny).global = self;
(self as RubicAny).Buffer = require('buffer').Buffer;
