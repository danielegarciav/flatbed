abstract class Component {
  entity?: Entity;
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
  // components = new Map<Class<Component>, Component>();
  components: Component[] = [];
}

class Player extends Entity {
  health: Health;
  movement: Movement;

  constructor() {
    super();
    this.components.push((this.health = new Health()));
    this.components.push((this.movement = new Movement()));
  }
}

class Enemy extends Entity {
  health: Health;
  movement: Movement;
  target?: Entity;

  constructor() {
    super();
    this.components.push((this.health = new Health()));
    this.components.push((this.movement = new Movement()));
  }
}

// class EntityCollection {
// entities = new Set<Entity>();
// entities: Entity[] = [];

// add(entity: Entity) {
//   this.entities.add(entity);
// }
// }

class World {
  entities: Entity[] = [];
  waveCount = 1;
  timeToNextWave = 10;
  someObject = { test: 'hello' };
}

export function createTestWorld(): World {
  const world = new World();
  const player = new Player();
  const enemy = new Enemy();
  enemy.target = player;
  enemy.health.health = 50;
  enemy.movement.velocity = 10;
  world.entities.push(player);
  world.entities.push(enemy);
  return world;
}

export const classes = { Health, Movement, Player, Enemy, World };
