import type { ObjRef } from './obj-repo';
import { AnyObj, isObject, Primitive } from './js-types';

/**
 * A reference to an object whose children referred to before it finishing serializing.
 * Resolved after all objects have been added to the flat repository.
 */
export interface CircularRef {
  __cref: AnyObj;
}

/** Returns true if input is a circurlar reference object. */
export const isCref = (x: unknown): x is CircularRef => isObject(x) && typeof x.__cref !== 'undefined';

/** The type of values allowed to be in the non-root data of a serialized object. */
export type SerialValue = ObjRef | CircularRef | SerializedArray | Primitive | undefined;

/** An array with serialized values inside. */
export type SerializedArray = Array<SerialValue>;

/** The type of values allowed to be in the root data of a serialized object. */
export type SerializedObjectData = Record<string, SerialValue> | SerialValue;

export interface SerializedObject {
  /** Serialized class name */
  __c: string;
  /** Serialized data */
  __d: SerializedObjectData;
}

/**
 * The root object of the flat structure returned by `serialize`.
 */
export interface RootSerializedObj extends SerializedObject {
  /** Serialized flat object array */
  __o: SerializedObject[];
}
