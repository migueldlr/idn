import { Schema, MapSchema, type } from '@colyseus/schema';

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

    @type('string')
    id: string;

    constructor(id: string) {
        super();
        this.id = id;
    }
}

export class GameState extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();
}
