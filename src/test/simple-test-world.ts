import { Class } from '../js-types';

abstract class Component {
  entity?: Entity;

  setEntity(entity: Entity) {
    this.entity = entity;
  }
}

class Health extends Component {
  health = 100;
}

class Movement extends Component {
  velocity = 0;
}

let nextId = 0;

class Entity {
  id = nextId++;
  x = 0;
  y = 0;
  isDestroyed = false;
  components = new Map<Class<Component>, Component>();

  addComponent<T extends Component>(component: T) {
    const componentClass = component.constructor as Class<T>;
    this.components.set(componentClass, component);
    component.setEntity(this);
    return component;
  }
}

class Player extends Entity {
  health: Health;
  movement: Movement;

  constructor() {
    super();
    this.addComponent((this.health = new Health()));
    this.addComponent((this.movement = new Movement()));
  }
}

class Enemy extends Entity {
  health: Health;
  movement: Movement;
  target?: Entity;

  constructor() {
    super();
    this.addComponent((this.health = new Health()));
    this.addComponent((this.movement = new Movement()));
  }
}

class EntityCollection {
  entities = new Set<Entity>();

  add(entity: Entity) {
    this.entities.add(entity);
  }
}

class World {
  entities = new EntityCollection();
  waveCount = 1;
  timeToNextWave = 10;
}

export function createTestWorld(): World {
  const world = new World();
  const player = new Player();
  const enemy = new Enemy();
  enemy.target = player;
  enemy.health.health = 50;
  enemy.movement.velocity = 10;
  world.entities.add(player);
  world.entities.add(enemy);
  return world;
}

export const classes = { Health, Movement, Player, Enemy, EntityCollection, World };
