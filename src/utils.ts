import { Player, Asteroid } from './schema';

export function distance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function angleBetween(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function getClosestAsteroid(
    player: Player,
    allAsteroids: Asteroid[]
): Asteroid {
    let minDistance = 600 * 800;
    // temporary value of the first asteroid
    let closestAsteroid: Asteroid = allAsteroids[0];
    allAsteroids.forEach((ast) => {
        const tempDistance = distance(ast.p.x, ast.p.y, player.p.x, player.p.y);
        if (tempDistance < minDistance) {
            minDistance = tempDistance;
            closestAsteroid = ast;
        }
    });
    return closestAsteroid;
}
