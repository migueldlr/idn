import * as Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';

import { Player, GameState, Asteroid } from '../../../schema';
import { addPlayerPoly, updatePlayerPoly } from '../PlayerUtil';
import { makeAsteroids } from '../SceneUtil';

interface PlayerInput {
    dir: string;
    time: number;
}

export default class GameScene extends Phaser.Scene {
    playerPoly?: Phaser.GameObjects.Polygon;
    player: Player;
    otherplayersDisplay: Record<string, Phaser.GameObjects.Polygon>;
    otherplayers: Record<string, Player>;
    client: Colyseus.Client;
    keys: { [s: string]: Phaser.Input.Keyboard.Key };
    room?: Colyseus.Room<GameState>;
    asteroidGroup: Phaser.GameObjects.Group;

    pendingInput: PlayerInput[];

    constructor() {
        super('game-scene');
        this.player = new Player('');
        this.playerPoly = undefined;
        this.otherplayersDisplay = {};
        this.otherplayers = {};
        this.asteroidGroup = new Phaser.GameObjects.Group(this);
        this.client = new Colyseus.Client('ws://localhost:2567');
        this.keys = {};
        this.pendingInput = [];
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
                this.player = player;
                this.playerPoly = addPlayerPoly(this, player, 'player');
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
                this.player = player;
                updatePlayerPoly(player, this.playerPoly);
            } else {
                this.otherplayers[id] = player;
                updatePlayerPoly(player, this.otherplayersDisplay[id]);
            }
            console.log(this.room?.state.lastupdated);
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
        // TODO: have not yet done client-side reconciliation
        if (this.keys.LEFT.isDown) {
            const input: PlayerInput = { dir: 'left', time: +new Date() };
            this.room.send('move', input);
            this.player.a -= 0.05;
            // this.pendingInput.push(input);
        }
        if (this.keys.RIGHT.isDown) {
            const input: PlayerInput = { dir: 'right', time: +new Date() };
            this.room.send('move', input);
            this.player.a += 0.05;
            // this.pendingInput.push(input);
        }
        if (this.keys.UP.isDown) {
            const input: PlayerInput = { dir: 'forward', time: +new Date() };
            this.room.send('move', input);
            if (this.player.v < 5) this.player.v += 0.1;
            // this.pendingInput.push(input);
        }
        if (this.keys.DOWN.isDown) {
            const input: PlayerInput = { dir: 'backward', time: +new Date() };
            this.room.send('move', input);
            if (this.player.v > 0) this.player.v -= 0.1;
            // this.pendingInput.push(input);
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

        // interpolate current player's movement
        if (this.player != null) {
            this.player.p.x += this.player.v * Math.cos(this.player.a);
            this.player.p.y += this.player.v * Math.sin(this.player.a);
            updatePlayerPoly(this.player, this.playerPoly);
        }
    }
}
