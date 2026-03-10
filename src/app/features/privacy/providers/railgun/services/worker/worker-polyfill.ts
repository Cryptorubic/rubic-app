// worker-polyfills.ts
import { RubicAny } from '@shared/models/utility-types/rubic-any';

(self as RubicAny).global = self;
(self as RubicAny).process = require('process');
(self as RubicAny).Buffer = require('buffer').Buffer;

(self as RubicAny).document = {
  createElement: () => ({}),
  // @ts-ignore
  getElementsByTagName: () => [],
  documentElement: { style: {} },
  cookie: '',
  visibilityState: 'visible',
  addEventListener: () => {},
  baseURI: self.location.href
};
