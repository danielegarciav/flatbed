import { newObjRepo, ObjRef, ObjRepo } from './obj-repo';
import {
  CircularRef,
  isCref,
  RootSerializedObj,
  SerializedArray,
  SerializedObject,
  SerializedObjectData,
  SerialValue,
} from './serialized-types';
import { AnyObj, Class, isClass, isObject, isPrimitive, Obj, Primitive } from './js-types';

/** Returns true if input is of a serializable type. */
const isSerializable = (x: unknown): x is Obj | Class<any> | Primitive =>
  x !== undefined && typeof x !== 'symbol' && typeof x !== 'bigint';

type SerialObjRepo = ObjRepo<SerializedObject>;
type RefMap = Map<AnyObj, ObjRef>;
type CrefMap = Map<AnyObj, CircularRef>;

/**
 * Serializes the given object into a flat, JSON-friendly structure that can be
 * resurrected back to its original state with `deserialize`.
 * @param obj The object to serialize.
 */
export function serialize(obj: AnyObj): RootSerializedObj {
  if (!isObject(obj)) throw Error('Unserializable non-object root');
  const serialObjRepo = newObjRepo<SerializedObject>();
  const refs: RefMap = new Map();
  const circularRefs: CrefMap = new Map();
  const rootData = serializeRootObject(obj, serialObjRepo, refs, circularRefs);
  const serialObjs = serialObjRepo.toArray();

  for (const { __d: data } of serialObjs) {
    if (!isObject(data)) continue;
    resolveCircularDeps(data, refs);
  }

  const className = obj.constructor.name;
  return { __d: rootData, __c: className, __o: serialObjs };
}

function serializeRootObject(
  x: AnyObj,
  o: SerialObjRepo,
  r: RefMap,
  c: CrefMap,
): SerializedObjectData | SerializedArray {
  if (Array.isArray(x)) return x.map(val => getSerializedValue(val, o, r, c));

  const data: SerializedObjectData = {};
  for (const [key, val] of Object.entries(x)) {
    data[key] = getSerializedValue(val, o, r, c);
  }
  return data;
}

function getSerializedValue(x: unknown, o: SerialObjRepo, r: RefMap, c: CrefMap): SerialValue {
  if (!isSerializable(x)) return;
  if (isPrimitive(x)) return x;

  const ref = r.get(x);
  if (ref) return ref;

  const cref = c.get(x);
  if (cref) return cref;
  c.set(x, { __cref: x });

  if (isClass(x)) {
    const newRef = o.addObj({ __c: 'Class', __d: x.name });
    r.set(x, newRef);
    return newRef;
  }

  const type = x.constructor.name;

  if (x instanceof Set) {
    const data = Array.from(x.values()).map(val => getSerializedValue(val, o, r, c));
    const newRef = o.addObj({ __c: type, __d: data });
    r.set(x, newRef);
    return newRef;
  }

  if (x instanceof Map) {
    const data = Array.from(x.entries()).map(val => getSerializedValue(val, o, r, c));
    const newRef = o.addObj({ __c: type, __d: data });
    r.set(x, newRef);
    return newRef;
  }

  if (Array.isArray(x)) {
    const newArray = x.map(val => getSerializedValue(val, o, r, c));
    return newArray;
  }

  if (isObject(x)) {
    const data: SerializedObjectData = {};
    for (const [key, val] of Object.entries(x)) {
      data[key] = getSerializedValue(val, o, r, c);
    }
    const newRef = o.addObj({ __c: type, __d: data });
    r.set(x, newRef);
    return newRef;
  }
}

/**
 * Recursively replaces all unserialized circular references in the given
 * object with proper serialized object references.
 */
function resolveCircularDeps(obj: Record<string, SerialValue>, r: RefMap): void {
  for (const [key, val] of Object.entries(obj)) {
    if (isCref(val)) {
      const ref = r.get(val.__cref);
      if (!ref) throw new Error('Object reference not found');
      obj[key] = ref;
    } else if (isObject(val)) {
      resolveCircularDeps(val as AnyObj, r);
    }
  }
}
