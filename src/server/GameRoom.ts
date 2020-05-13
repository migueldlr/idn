import { Room, Client } from 'colyseus';
import { GameState, Player, Asteroid } from '../schema';
import { SCENE_HEIGHT, SCENE_WIDTH } from '../constants';

export class GameRoom extends Room<GameState> {
    onCreate(_options?: any): void {
        // adds in the asteroids
        this.initState();
        this.clock.start();
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
        this.onMessage(
            'move',
            (client, message: { dir: string; time: number }) => {
                const { dir, time } = message;
                // console.log(`${time}  ${+new Date()}`);
                const player: Player = this.state.players[client.id];
                // handle "type" message
                if (dir === 'left') {
                    player.a -= 0.05;
                }
                if (dir === 'right') {
                    player.a += 0.05;
                }
                if (dir === 'forward') {
                    if (player.v < 5) player.v += 0.1;
                }
                if (dir === 'backward') {
                    if (player.v > 0) player.v -= 0.1;
                }
            }
        );
    }

    onJoin(client: Client, _options: any): void {
        console.log(`${client.id} joined`);
        const p = new Player(client.id);
        client.send('asteroids', this.state.asteroids);
        p.p.x = Math.random() * 100;
        p.p.y = Math.random() * 100;
        this.state.players[client.id] = p;
        // this.broadcast('playerJoined', this.state.players[client.id]);
    }

    initState(): void {
        this.setState(new GameState());
        for (let i = 0; i < 20; i++) {
            const asteroid = new Asteroid();
            asteroid.p.x = Math.random() * SCENE_WIDTH;
            asteroid.p.y = Math.random() * SCENE_HEIGHT;
            this.state.asteroids.push(asteroid);
        }
    }

    onLeave(client: Client, _consented: boolean): void {
        console.log(`${client.id} left`);
        delete this.state.players[client.id];
    }

    onDispose(): void {
        console.log('disposing!');
    }

    // update game state (60fps)
    update(_delta: number): void {
        const getClosestAsteroid = function (
            player: Player,
            allAsteroids: Asteroid[]
        ): Asteroid {
            let minDistance = 600 * 800;
            // this function def should probably go somewhere else
            const dist = function (
                x1: number,
                x2: number,
                y1: number,
                y2: number
            ): number {
                return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            };
            // temporary value of the first asteroid
            let closestAsteroid: Asteroid = allAsteroids[0];
            allAsteroids.forEach((ast) => {
                const tempDistance = dist(
                    ast.p.x,
                    player.p.x,
                    ast.p.y,
                    player.p.y
                );
                if (tempDistance < minDistance) {
                    minDistance = tempDistance;
                    closestAsteroid = ast;
                }
            });
            return closestAsteroid;
        };
        // need to get them as sprites so you can get the x and y positions
        const allAsteroids: Asteroid[] = this.state.asteroids;

        // update positions and lines
        for (const id in this.state.players) {
            const player = this.state.players[id];

            player.p.x += player.v * Math.cos(player.a);
            player.p.y += player.v * Math.sin(player.a);

            const closestAsteroid: Asteroid = getClosestAsteroid(
                player,
                allAsteroids
            );
            // set which asteroid is closest on our player object, used when we are not the main player
            player.closestAsteroid = closestAsteroid;
            console.log(player.closestAsteroid.p.x, player.closestAsteroid.p.y);
        }

        this.state.lastupdated = +new Date();
    }
}
