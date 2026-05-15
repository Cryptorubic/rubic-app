import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { EventEmitter } from 'events';

const processPolyfill = require('process');

const emitter = new EventEmitter();
Object.assign(processPolyfill, {
  on: emitter.on.bind(emitter),
  emit: emitter.emit.bind(emitter),
  once: emitter.once.bind(emitter),
  removeAllListeners: emitter.removeAllListeners.bind(emitter)
});

(self as RubicAny).process = processPolyfill;
(self as RubicAny).window = self;
(self as RubicAny).global = self;
(self as RubicAny).Buffer = require('buffer').Buffer;
