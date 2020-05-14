import { Room, Client } from 'colyseus';
import { GameState, Player, Asteroid } from '../schema';
import { SCENE_HEIGHT, SCENE_WIDTH } from '../constants';
import { distance, getClosestAsteroid, angleBetween } from '../utils';

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
                if (dir === 'space') {
                    const r = distance(
                        player.p.x,
                        player.p.y,
                        player.closestAsteroid.p.x,
                        player.closestAsteroid.p.y
                    );
                    const angle = angleBetween(
                        player.p.x,
                        player.p.y,
                        player.closestAsteroid.p.x,
                        player.closestAsteroid.p.y
                    );
                    // TODO: this is absolutely not even close but I need to put something here to not forget about it
                    const forceScalingFactor = -30;
                    const angleScalingFactor = 0.5;
                    const force = forceScalingFactor / r ** 2;
                    player.v += force;
                    player.a += angle * angleScalingFactor;
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
        // update positions and lines
        for (const id in this.state.players) {
            const player = this.state.players[id];

            player.p.x += player.v * Math.cos(player.a);
            player.p.y += player.v * Math.sin(player.a);

            const closestAsteroid: Asteroid = getClosestAsteroid(
                player,
                this.state.asteroids
            );
            // set which asteroid is closest on our player object
            player.closestAsteroid = closestAsteroid;
            console.log(player.closestAsteroid.p.x, player.closestAsteroid.p.y);
        }

        this.state.lastupdated = +new Date();
    }
}
