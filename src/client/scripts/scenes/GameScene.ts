import * as Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';

import { Player, GameState } from '../../../schema';

export default class GameScene extends Phaser.Scene {
    player?: Phaser.GameObjects.Polygon;
    otherplayers: Record<string, Phaser.GameObjects.Polygon>;
    client: Colyseus.Client;
    keys: { [s: string]: Phaser.Input.Keyboard.Key };
    room?: Colyseus.Room<GameState>;
    constructor() {
        super('game-scene');
        this.player = undefined;
        this.otherplayers = {};
        this.client = new Colyseus.Client('ws://localhost:2567');
        this.keys = {};
    }

    // preload(): void {}

    create(): void {
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT') as {
            [s: string]: Phaser.Input.Keyboard.Key;
        };
        this.client
            .joinOrCreate<GameState>('game')
            .then((room) => {
                this.room = room;
                room.state.players.onAdd = (player, id): void => {
                    if (id === room.sessionId) {
                        this.player = this.addPlayer(player);
                        this.player.name = 'player';
                    } else {
                        this.otherplayers[id] = this.addPlayer(player);
                    }
                };

                room.state.players.onRemove = (_, id): void => {
                    console.log(`${id} left!`);
                    this.otherplayers[id].destroy();
                    delete this.otherplayers[id];

                    console.log(`${JSON.stringify(this.otherplayers)}`);
                };

                room.state.players.onChange = (player, id): void => {
                    if (id === room.sessionId) {
                        this.updatePlayer(player, this.player);
                    } else {
                        this.updatePlayer(player, this.otherplayers[id]);
                    }
                };
            })
            .catch((e) => {
                console.error('JOIN ERROR', e);
            });
        // this.socket.on('currentPlayers', (players: Record<string, Player>) => {
        //     console.log(players);
        //     Object.keys(players).forEach((id) => {
        //         if (players[id].id === this.socket.id) {
        //             this.addPlayer(players[id]);
        //         }
        //         //  else {
        //         //     addOtherPlayer(players[id]);
        //         // }
        //     });
        // });

        // this.socket.on('newPlayer', function (playerInfo: Player) {
        //     addOtherPlayer(playerInfo);
        // });

        // this.socket.on('disconnect', function (playerId: string) {
        //     otherplayers.children.forEach(function (otherPlayer) {
        //         if (playerId === otherPlayer.name) {
        //             otherPlayer.destroy();
        //         }
        //     });
        // });
    }

    addPlayer(player: Player): Phaser.GameObjects.Polygon {
        const path: number[][] = [
            [10, 0],
            [-5, 5],
            [0, 0],
            [-5, -5],
            [10, 0],
        ];
        // player = new Player(poly);
        // player.g.position.x = engine.renderer.width / 2;
        // player.g.position.y = engine.renderer.height / 2;
        const poly = this.add.polygon(player.p.x, player.p.y, path, 0xffffff);
        poly.setOrigin(0);
        poly.rotation = player.a;
        return poly;
    }

    updatePlayer(player: Player, current?: Phaser.GameObjects.Polygon): void {
        if (current == null) return;
        current.rotation = player.a;
        current.setPosition(player.p.x, player.p.y);
    }

    update(_time: number, _delta: number): void {
        // console.log(`${time} ${delta}`);
        // if (this.keys.left)
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
    }
}
