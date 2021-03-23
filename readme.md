# flatbed

Advanced JavaScript object serializer written in TypeScript. Packs objects into a flat, JSON-friendly
structure, keeping track of circular references and object constructors.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of contents**

- [flatbed](#flatbed)
  - [Installation](#installation)
    - [For Node.js and bundlers (Webpack, Rollup, etc)](#for-nodejs-and-bundlers-webpack-rollup-etc)
    - [For browsers (script tag)](#for-browsers-script-tag)
  - [Release notes](#release-notes)
  - [Usage](#usage)
  - [API documentation](#api-documentation)
  - [Brief simplified API summary](#brief-simplified-api-summary)
    - [`serialize(obj: object): object`](#serializeobj-object-object)
    - [`deserialize(obj: object, classes?: class[]): object`](#deserializeobj-object-classes-class-object)
    - [`stringify(obj: object): string`](#stringifyobj-object-string)
    - [`parse(json: string, classes?: class[]): object`](#parsejson-string-classes-class-object)
    - [Built-in classes](#built-in-classes)
  - [Deeper example](#deeper-example)
  - [Development and contributions](#development-and-contributions)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

### For Node.js and bundlers (Webpack, Rollup, etc)

```bash
npm i flatbed
# or
yarn add flatbed
```

### For browsers (script tag)

Browser builds aren't available yet, but they are planned for the future.

## Release notes

See information about breaking changes and release notes [here](changelog.md).

## Usage

Flatbed provides `serialize` and `deserialize` function that convert objects to and from a flat JSON-friendly
structure.

It also provides convenience `stringify` and `parse` functions that directly turn serialized objects to
strings and viceversa, and can be used for the majority of use cases.

```js
import { stringify, parse } from 'flatbed';

const foo = { hello: 'world!', circularReference: [] };
const root = { listOfThings: [foo] };
foo.circularReference = root.listOfThings;

const json = stringify(root);

// JSON can be transferred to disk, memory, network, etc.

const deserialized = parse(json);
console.log(`Hello ${deserialized.listOfThings[0].circularReference[0].hello}`);
// Outputs: "Hello world!"
```

## API documentation

The most up-to-date documentation for this package is automatically generated from code and available at
https://danielegarciav.github.io/flatbed/.

## Brief simplified API summary

### `serialize(obj: object): object`

Serializes the given object into a flat JSON-friendly structure.

### `deserialize(obj: object, classes?: class[]): object`

Deserializes a previously serialized object into its original state. An array can be supplied with the
classes/constructors of the serialized objects.

### `stringify(obj: object): string`

Serializes the given object and stringifies it into JSON.

### `parse(json: string, classes?: class[]): object`

Parses the given JSON string as a serialized object, deserializes it, and returns the object in its original
state. An array can be supplied with the classes/constructors of the serialized objects.

### Built-in classes

Flatbed already knows how to construct the following built-in JS objects and won't require you to pass them
in:

- `Object`
- `Array`
- `Map`
- `Set`

## Deeper example

Flatbed will generate structures that keep track of the constructors of the serialized objects. When
deserializing objects of custom classes, you must pass these constructors to `deserialize`.

This example is written in TypeScript for clarity, but works the same in plain JavaScript.

```ts
import { serialize, deserialize } from 'flatbed';

class Player {
  x = 0;
  y = 0;
  name: string;
  target?: Player;

  constructor(name: string) {
    this.name = name;
  }

  setTarget(t: Player) {
    this.target = t;
  }

  sayTarget() {
    this.target && console.log(`My target is ${this.target.name}`);
  }
}

class World {
  players = new Set<Player>();

  logPlayers() {
    console.log(`Players: ${[...this.players].map(p => p.name).join(', ')}`);
  }
}

const world = new World();
const player1 = new Player('Alice');
const player2 = new Player('Bob');
player1.setTarget(player2);
player2.setTarget(player1);
world.players.add(player1);
world.players.add(player2);

const json = stringify(serialized);

// JSON can be transferred to disk, memory, network, etc.

const deserialized = parse<World>(json, [World, Player]);

deserialized instanceof World; // true
deserialized.logPlayers(); // "Players: Alice, Bob"

deserialized.players instanceof Set; // true
[...deserialized.players][0] instanceof Player; // true
[...deserialized.players][0].sayTarget(); // "My target is Bob"
```

## Development and contributions

Check package.json to find scripts related to installing dependencies, building, testing, linting and
generating documentation. I am open to new issues and pull requests!

## License

MIT
