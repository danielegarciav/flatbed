import { serialize, stringify } from '../serialization';
import { deserialize, parse } from '../deserialization';
import { createTestWorld as createSimpleTestWorld, classes as simpleClasses } from './complex-test-world';
import { createTestWorld as createComplexTestWorld, classes as complexClasses } from './simple-test-world';
import { createUnserializableTestWorld } from './unserializable-test-world';

describe('serialization/deserialization', () => {
  test('simple world', () => {
    type World = typeof simpleClasses.World;
    const firstWorld = createSimpleTestWorld();
    const firstSerialization = serialize(firstWorld);
    const firstJson = JSON.stringify(firstSerialization);

    const secondWorld = deserialize<World>(JSON.parse(firstJson), simpleClasses);
    expect(firstWorld).toEqual(secondWorld);

    const secondSerialization = serialize(secondWorld);
    expect(firstSerialization).toEqual(secondSerialization);

    const secondJson = JSON.stringify(secondSerialization);
    expect(firstJson).toBe(secondJson);
  });

  test('complex world', () => {
    type World = typeof complexClasses.World;
    const firstWorld = createComplexTestWorld();
    const firstSerialization = serialize(firstWorld);
    const firstJson = JSON.stringify(firstSerialization);

    const secondWorld = deserialize<World>(JSON.parse(firstJson), complexClasses);
    expect(firstWorld).toEqual(secondWorld);

    const secondSerialization = serialize(secondWorld);
    expect(firstSerialization).toEqual(secondSerialization);

    const secondJson = JSON.stringify(secondSerialization);
    expect(firstJson).toBe(secondJson);
  });

  test('unserializable', () => {
    const firstWorld = createUnserializableTestWorld();
    type World = typeof firstWorld;
    const firstSerial = serialize(firstWorld);
    expect(() => deserialize<World>(firstSerial)).toThrow();
  });

  test('stringify/parse', () => {
    type World = typeof simpleClasses.World;
    const firstWorld = createSimpleTestWorld();
    const firstJson = stringify(firstWorld);

    const secondWorld = parse<World>(firstJson, simpleClasses);
    expect(firstWorld).toEqual(secondWorld);

    const secondJson = stringify(secondWorld);
    expect(firstJson).toBe(secondJson);
  });
});
