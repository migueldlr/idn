import * as Phaser from 'phaser';
import { Player } from '../../schema';

export const addPlayerPoly = (
    scene: Phaser.Scene,
    player: Player,
    name?: string
): Phaser.GameObjects.Polygon => {
    const path: number[][] = [
        [10, 0],
        [-5, 5],
        [0, 0],
        [-5, -5],
        [10, 0],
    ];
    const poly = scene.add.polygon(player.p.x, player.p.y, path, 0xffffff);
    poly.setOrigin(0);
    poly.rotation = player.a;
    poly.name = name ?? '';
    return poly;
};

// Modify `current` to match `player`
export const updatePlayerPoly = (
    player: Player,
    current?: Phaser.GameObjects.Polygon
): void => {
    if (current == null) {
        console.error('current polygon is undefined');
        return;
    }
    current.rotation = player.a;
    current.setPosition(player.p.x, player.p.y);
};
