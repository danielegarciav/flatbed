import { AnyObj, isObject } from './js-types';

/**
 * A reference to an object stored in an object repository.
 */
export interface ObjRef {
  __ref: number;
}

/**
 * Object repository. Data structure that accepts and stores new objects, and
 * returns references to each stored object, which may be dereferenced later.
 *
 * @template T The type of objects to be stored.
 */
export interface ObjRepo<T = AnyObj> {
  /**
   * Adds a new object to the repository. Returns a reference to it.
   * @param obj The object to add to the repository.
   */
  addObj(obj: T): ObjRef;

  /**
   * Returns an existing reference to an object if it has already been stored
   * before. Returns `undefined` otherwise.
   * @param obj The object to check for.
   */
  getObjRef(obj: T): ObjRef | undefined;

  /**
   * Returns the object referred to by the given reference. Throws an error if
   * the reference is invalid.
   * @param ref The reference to dereference.
   */
  getObjByRef(ref: ObjRef): T;

  /**
   * Returns an array with all the stored objects in order of insertion, such
   * that references are still valid.
   */
  toArray(): T[];

  /**
   * Removes all objects stored in the repository.
   */
  dispose(): void;
}

/**
 * Constructs a new object repository.
 * @template T The type of object to be stored in the repository.
 */
export const newObjRepo = <T = AnyObj>(): ObjRepo<T> => {
  let nextId = 0;
  const objs = new Map<T, ObjRef>();
  const arr: T[] = [];

  return {
    addObj: (obj: T) => {
      if (objs.has(obj)) throw new Error('Object already in repo');
      const id = nextId;
      const ref: ObjRef = { __ref: id };
      nextId++;
      objs.set(obj, ref);
      arr.push(obj);
      return ref;
    },

    getObjRef: (obj: T) => objs.get(obj),

    getObjByRef: (ref: ObjRef) => {
      const obj = arr[ref.__ref];
      if (!obj) throw Error('Invalid object reference');
      return obj;
    },

    toArray: () => arr,

    dispose: () => {
      arr.splice(0, arr.length);
      objs.clear();
    },
  };
};

/** Returns true if the given input is an object reference. */
export const isObjRef = (x: any): x is ObjRef => isObject(x) && typeof x.__ref === 'number';

/** Reconstructs an object repository from an array of objects. */
export const objRepoFromArray = <T>(objs: T[]): ObjRepo<T> => {
  const repo = newObjRepo<T>();
  objs.forEach(o => repo.addObj(o));
  return repo;
};
