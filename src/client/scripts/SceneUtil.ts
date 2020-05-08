import * as Phaser from 'phaser';
import { Asteroid } from '../../schema';

export const makeAsteroids = (
    asteroidGroup: Phaser.GameObjects.Group,
    asteroid: Asteroid
): Phaser.GameObjects.Group => {
    // TODO: needs to start the physics system: https://github.com/photonstorm/phaser-examples/blob/master/examples/arcade%20physics/asteroids%20movement.js
    // add 20 asteroids to random spots
    const { x, y } = asteroid.p;
    asteroidGroup.create(x, y, 'asteroid');

    return asteroidGroup;
};
