/** Helper type representing any non-null object. */
export type Obj = Record<string | number | symbol, unknown>;

/** Returns true if input is a non-null object. */
export const isObject = (x: unknown): x is Obj => (x ? typeof x === 'object' : false);

/** Returns true if input is an array. */
export const isArray = <T>(x: unknown): x is T => Array.isArray(x);

/** `string`, `number`, or `boolean` */
export type Primitive = string | number | boolean;

/** Returns true if input is `string`, `number`, or `boolean` */
export const isPrimitive = (x: unknown): x is Primitive => ['string', 'number', 'boolean'].includes(typeof x);

/** A newable constructor function. */
export type Class<T> = new (...args: any[]) => T;

/** Returns true if input is a newable constructor function. */
export const isClass = (x: unknown): x is Class<any> => typeof x === 'function';

/** Helper type representing any non-null object (type unsafe). */
export type AnyObj = Record<string, any>;

/** Helper type representing any map (type unsafe). */
export type AnyMap = Map<any, any>;

/** Helper type representing any set (type unsafe). */
export type AnySet = Set<any>;
