import { newObjRepo } from '../obj-repo';

describe('ObjRepo', () => {
  test("does what it's supposed to do", () => {
    const repo = newObjRepo();
    const a = { a: true };
    const b = { b: true };
    const c = { c: true };
    expect(repo.getObjRef(a)).toBe(undefined);
    repo.addObj(b);
    expect(() => repo.addObj(b)).toThrow();
    const aRef1 = repo.addObj(a);
    const aRef2 = repo.getObjRef(a);
    expect(aRef1).toBe(aRef2);
    repo.addObj(c);
  });
});
