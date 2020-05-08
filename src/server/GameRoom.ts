import { Room, Client } from 'colyseus';
import { GameState, Player } from '../schema';

export class GameRoom extends Room<GameState> {
    onCreate(_options?: any): void {
        this.setState(new GameState());
        this.clock.start();
        this.setSimulationInterval((deltaTime) => this.update(deltaTime), 200);
        this.onMessage('move', (client, message: { dir: string }) => {
            const { dir } = message;
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
        });
    }

    onJoin(client: Client, _options: any): void {
        console.log(`${client.id} joined`);
        // client.send('currentPlayers', this.state.players);
        const p = new Player(client.id);
        p.p.x = Math.random() * 100;
        p.p.y = Math.random() * 100;
        this.state.players[client.id] = p;
        // this.broadcast('playerJoined', this.state.players[client.id]);
    }

    onLeave(client: Client, _consented: boolean): void {
        console.log(`${client.id} left`);
        delete this.state.players[client.id];
    }

    onDispose(): void {
        console.log('disposing!');
    }

    update(_delta: number): void {
        for (const id in this.state.players) {
            const player = this.state.players[id];

            player.p.x += player.v * Math.cos(player.a);
            player.p.y += player.v * Math.sin(player.a);
        }
    }
}
