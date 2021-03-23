import { newObjRepo, objRepoFromArray } from '../obj-repo';

describe('ObjRepo', () => {
  test("does what it's supposed to do", () => {
    const repo = newObjRepo();
    const a = { a: true };
    const b = { b: true };
    const c = { c: true };
    expect(repo.getObjRef(a)).toBe(undefined);

    const bRef = repo.addObj(b);
    expect(() => repo.addObj(b)).toThrow();
    expect(() => repo.getObjByRef({ __ref: -1 })).toThrow();
    expect(repo.getObjByRef(bRef)).toBe(b);

    const aRef1 = repo.addObj(a);
    const aRef2 = repo.getObjRef(a);
    expect(aRef1).toBe(aRef2);

    repo.addObj(c);
    const repoArray = repo.toArray();
    expect(repoArray).toEqual([b, a, c]);

    repo.dispose();
    expect(repo.toArray()).toEqual([]);

    const newRepo = objRepoFromArray(repoArray);
    expect(newRepo.toArray()).toEqual(repoArray);
  });
});
