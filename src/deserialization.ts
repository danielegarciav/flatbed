import { AnyObj, Class, isClass, isObject } from './js-types';
import { isObjRef } from './obj-repo';
import { RootSerializedObj, SerializedObjectData } from './serialized-types';

export type ClassDict<T> = Record<string, Class<T>>;
export type ClassArray<T> = Array<Class<T>>;
export type ClassMap<T> = Map<string, Class<T>>;

const classDictToMap = <T>(d: ClassDict<T>): ClassMap<T> => new Map(Object.entries(d));
const classArrayToMap = <T>(a: ClassArray<T>): ClassMap<T> => new Map(a.map(x => [x.name, x]));

const builtinClasses: ClassMap<any> = new Map(Object.entries({ Map, Set, Object }));

// Overloaded definitions

/**
 * Deserializes a previously serialized object.
 * @template Root The type of the object being returned.
 * @template C The union of the types of all classes expected to be reconstructed.
 * @param root The serialized object to deserialize.
 * @param classes The classes/constructor functions to use when reconstructing serialized objects.
 * Can be either a map, an object, or an array.
 */

export function deserialize<Root extends C, C = any>(root: RootSerializedObj, classes?: ClassArray<C>): Root;

/**
 * Deserializes a previously serialized object.
 * @template Root The type of the object being returned.
 * @template C The union of the types of all classes expected to be reconstructed.
 * @param root The serialized object to deserialize.
 * @param classDict The classes/constructor functions to use when reconstructing serialized objects.
 * Can be either a map, an object, or an array.
 */

export function deserialize<Root extends C, C = any>(root: RootSerializedObj, classDict?: ClassDict<C>): Root;

/**
 * Deserializes a previously serialized object.
 * @template Root The type of the object being returned.
 * @template C The union of the types of all classes expected to be reconstructed.
 * @param root The serialized object to deserialize.
 * @param classMap The classes/constructor functions to use when reconstructing serialized objects.
 * Can be either a map, an object, or an array.
 */

export function deserialize<Root extends C, C = any>(root: RootSerializedObj, classMap?: ClassMap<C>): Root;

// Implementation

export function deserialize<Root extends C, C = any>(
  root: RootSerializedObj,
  c: ClassMap<C> | ClassArray<C> | ClassDict<C> = {},
): Root {
  const { __c: rootClassName, __d: rootData, __o: serializedObjs } = root;
  const cm = c instanceof Map ? c : Array.isArray(c) ? classArrayToMap(c) : classDictToMap(c);

  // Step 1: Resolve all class constructors, instantiate objects with empty data
  const objInstances: Class<C> | AnyObj[] = [];
  const serializedDatas: SerializedObjectData[] = [];

  for (const { __c: className, __d: serialData } of serializedObjs) {
    // Classes (constructors) have class names as data
    if (className === 'Class') {
      if (typeof serialData !== 'string') throw new Error('Non-string class name');
      const className = serialData;
      const classObj = cm.get(className);
      if (!classObj) throw new Error(`Class "${className}" not found in class map`);
      objInstances.push(classObj);
      serializedDatas.push(undefined); // Classes do not contain any data, push empty (undefined) space
      continue;
    }

    // Instantiate empty object
    const objClass = cm.get(className) || builtinClasses.get(className);
    if (!objClass) throw new Error(`Class "${className}" not found in class map`);
    const objInstance = new objClass();
    objInstances.push(objInstance);

    // Keep track of data
    if (!isObject(serialData)) throw new Error('Non-object value found');
    serializedDatas.push(serialData);
  }

  // Step 2: Resolve refs in serialized data to the new empty instances
  for (const objData of serializedDatas) isObject(objData) && resolveRefs(objData, objInstances);

  // Step 3: Deserialize/assign data to the instances
  let serialDataIdx = -1;
  for (const obj of objInstances) {
    serialDataIdx++;

    // Classes/constructor functions don't have any additional data
    if (isClass(obj)) continue;
    const serialData = serializedDatas[serialDataIdx];

    // Set serialization - data is `value[]`
    if (obj instanceof Set) {
      if (!Array.isArray(serialData)) throw new Error('Set has non-array data');
      serialData.forEach(val => obj.add(val));
      continue;
    }

    // Map serialization - data is `[key, value][]`
    if (obj instanceof Map) {
      if (!Array.isArray(serialData)) throw new Error('Map has non-array data');
      serialData.forEach(pair => {
        if (!Array.isArray(pair)) throw new Error('Non-array map element pair');
        const [key, val] = pair;
        obj.set(key, val);
      });
      continue;
    }

    // Any other object - simple property assignment
    if (!isObject(serialData)) throw new Error('Object has non-object data');
    Object.assign(obj, serialData);
  }

  // Step 4: Instantiate empty root
  const rootClass = cm.get(rootClassName) || builtinClasses.get(rootClassName);
  if (!rootClass) throw new Error(`Class "${rootClassName}" not found in class map`);
  const rootInstance = new rootClass() as Root;

  // Step 5: Resolve refs in root data to deserialized instances, assign to root instance
  if (isObject(rootData)) {
    resolveRefs(rootData, objInstances);
    Object.assign(rootInstance, rootData);
  }

  return rootInstance;
}

/**
 * Recursively replaces any `ObjRef` object references in the given object with
 * live objects from the given array.
 */
function resolveRefs(x: AnyObj, objs: AnyObj[]): void {
  for (const [key, val] of Object.entries(x)) {
    if (isObjRef(val)) {
      const target = objs[val.__ref];
      if (!target) throw new Error('Invalid object reference');
      x[key] = target;
    } else if (isObject(val)) {
      resolveRefs(val, objs);
    }
  }
}
