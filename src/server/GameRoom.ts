import { Room, Client } from 'colyseus';
import { GameState, Player } from '../schema';

export class GameRoom extends Room<GameState> {
    onCreate(_options?: any): void {
        this.setState(new GameState());
        this.onMessage('move', (client, message: { dir: string }) => {
            const { dir } = message;
            // handle "type" message
            if (dir === 'left') {
                this.state.players[client.id].a -= 0.05;
            }
            if (dir === 'right') {
                this.state.players[client.id].a += 0.05;
            }
            console.log(`${client.id} ${dir}`);
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
}
