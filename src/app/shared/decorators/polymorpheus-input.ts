/* eslint-disable */

import { TuiDialogContext } from "@taiga-ui/core";

/**
 * Decorator for Components with @Input Decorator, that are used as Polymorpheus Templates.
 * If the Component is used as a Polymorpheus Template, then,
 * data for @Input properties is taken from @POLYMORPHEUS_CONTEXT.
 */

export function PolymorpheusInput(): any {
    return function (target: any, propertyKey: string | symbol, propertyDescriptor: PropertyDescriptor) {

        const key = Symbol();
        return {
            get() {
                const context: TuiDialogContext = this.context;
                // TODO: Change type guard for something else 
                if (context && '$implicit' in context) {
                    return this.context.data[propertyKey];
                }
                return this[key];
            },
            set(newValue: any) {
                this[key] = newValue;
                if (propertyDescriptor) {
                    propertyDescriptor.set(newValue);
                }
                return this;
            }
        }
    }
}
