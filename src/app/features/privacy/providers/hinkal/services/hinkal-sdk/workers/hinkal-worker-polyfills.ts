import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

(self as RubicAny).window = self;
(self as RubicAny).global = self;
(self as RubicAny).process = require('process');
(self as RubicAny).Buffer = require('buffer').Buffer;
