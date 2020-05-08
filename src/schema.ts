import { Schema, ArraySchema, MapSchema, type } from '@colyseus/schema';

export class Point extends Schema {
    @type('float64')
    x = 0;

    @type('float64')
    y = 0;
}

export class Player extends Schema {
    @type(Point)
    p: Point = new Point();

    @type('number')
    a = 0;

    @type('number')
    v = 0;

    @type('string')
    id: string;

    constructor(id: string) {
        super();
        this.id = id;
    }
}

export class Asteroid extends Schema {
    @type(Point)
    p: Point = new Point();
}

export class GameState extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    @type([Asteroid])
    asteroids = new ArraySchema<Asteroid>();

    @type('number')
    lastupdated = 0;
}
