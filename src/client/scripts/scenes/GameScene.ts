import * as Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';

import { Player, GameState, Asteroid } from '../../../schema';
import { addPlayerPoly, updatePlayerPoly } from '../PlayerUtil';
import { makeAsteroids } from '../SceneUtil';

export default class GameScene extends Phaser.Scene {
    player?: Phaser.GameObjects.Polygon;
    otherplayersDisplay: Record<string, Phaser.GameObjects.Polygon>;
    otherplayers: Record<string, Player>;
    client: Colyseus.Client;
    keys: { [s: string]: Phaser.Input.Keyboard.Key };
    room?: Colyseus.Room<GameState>;
    asteroidGroup: Phaser.GameObjects.Group;
    constructor() {
        super('game-scene');
        this.player = undefined;
        this.otherplayersDisplay = {};
        this.otherplayers = {};
        this.asteroidGroup = new Phaser.GameObjects.Group(this);
        this.client = new Colyseus.Client('ws://localhost:2567');
        this.keys = {};
    }

    preload(): void {
        this.load.image('asteroid', 'images/asteroidOne.png');
    }

    create(): void {
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT') as {
            [s: string]: Phaser.Input.Keyboard.Key;
        };
        this.client
            .joinOrCreate<GameState>('game')
            .then((room) => {
                this.room = room;
                console.log(this.room.state.asteroids.length);

                this.attachRoomListeners(this.room);
            })
            .catch((e) => {
                console.error('JOIN ERROR', e);
            });
    }

    // adds what to do if a player joins, leaves, or changes to the room
    attachRoomListeners(room: Colyseus.Room<GameState>): void {
        room.state.players.onAdd = (player, id): void => {
            if (id === room.sessionId) {
                this.player = addPlayerPoly(this, player, 'player');
            } else {
                this.otherplayers[id] = player;
                this.otherplayersDisplay[id] = addPlayerPoly(this, player);
            }
        };

        room.state.players.onRemove = (_, id): void => {
            console.log(`${id} left!`);
            this.otherplayersDisplay[id].destroy();
            delete this.otherplayersDisplay[id];
            delete this.otherplayers[id];

            console.log(`${JSON.stringify(this.otherplayers)}`);
        };

        // Receive authoritative game state from server
        room.state.players.onChange = (player, id): void => {
            if (id === room.sessionId) {
                updatePlayerPoly(player, this.player);
            } else {
                this.otherplayers[id] = player;
                updatePlayerPoly(player, this.otherplayersDisplay[id]);
            }
        };

        // room.state.asteroids.onChange = (asteroid: Asteroid) => {
        //     console.log('asteroids changed');
        //     makeAsteroids(this.asteroidGroup, asteroid);
        // };

        room.onMessage('asteroids', (asteroids: Asteroid[]) => {
            asteroids.forEach((asteroid) => {
                makeAsteroids(this.asteroidGroup, asteroid);
            });
        });
    }

    update(_time: number, _delta: number): void {
        if (this.room == null) {
            return;
        }
        if (this.keys.LEFT.isDown) {
            this.room.send('move', { dir: 'left' });
        }
        if (this.keys.RIGHT.isDown) {
            this.room.send('move', { dir: 'right' });
        }
        if (this.keys.UP.isDown) {
            this.room.send('move', { dir: 'forward' });
        }

        // interpolate movement for other players
        for (const id in this.otherplayers) {
            const otherPlayer: Player = this.otherplayers[id];
            otherPlayer.p.x += otherPlayer.v * Math.cos(otherPlayer.a);
            otherPlayer.p.y += otherPlayer.v * Math.sin(otherPlayer.a);
        }

        for (const id in this.otherplayers) {
            updatePlayerPoly(
                this.otherplayers[id],
                this.otherplayersDisplay[id]
            );
        }
    }
}
