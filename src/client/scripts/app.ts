import * as PIXI from 'pixi.js';
import * as io from 'socket.io-client';
import { FpsMeter } from './fps-meter';
import Player from '../../player';
import Multikey from './multikey';
import Engine from './engine';
import { randInt, dist } from './util';

const engine = new Engine({
    containerId: 'game',
    canvasW: 800,
    canvasH: 450,
    fpsMax: 60,
});

let fpsMeter: FpsMeter;
let multikey: Multikey;
let asteroids: PIXI.Graphics[];
let lines: PIXI.Container;
let socket: SocketIOClient.Socket;
let otherplayers: PIXI.Container;

// ==============
// === STATES ===
// ==============

function render(): void {
    requestAnimationFrame(render);

    /* ***************************** */
    /* Render your Game Objects here */
    /* ***************************** */
    engine.renderer.render(engine.stage);
    fpsMeter.tick();
} // render

function update(): void {
    // player.v *= 0.99;

    if (multikey.keys.has(' ')) {
        console.log(engine.stage.children);
    }
    // if (multikey.keys.has('ArrowUp') && !multikey.keys.has(' ')) {
    //     if (player.v < 5) {
    //         player.v += 0.1;
    //     }
    // }

    // if (multikey.keys.has('ArrowLeft')) {
    //     player.a -= 0.05;
    // }

    // if (multikey.keys.has('ArrowRight')) {
    //     player.a += 0.05;
    // }

    // player.g.position.x += player.getvx();
    // player.g.position.y += player.getvy();

    // if (player.g.position.x > engine.renderer.width - 5) {
    //     player.setvx(Math.min(0, player.getvx()));
    //     player.g.position.x = engine.renderer.width - 5;
    // }
    // if (player.g.position.y > engine.renderer.height - 5) {
    //     player.setvy(Math.min(0, player.getvy()));
    //     player.g.position.y = engine.renderer.height - 5;
    // }
    // if (player.g.position.x < 0) {
    //     player.setvx(Math.max(0, player.getvx()));
    //     player.g.position.x = 0;
    // }
    // if (player.g.position.y < 0) {
    //     player.setvy(Math.max(0, player.getvy()));
    //     player.g.position.y = 0;
    // }

    // let minDist = engine.renderer.width * engine.renderer.height;
    // let minIndex = multikey.keys.has(' ') ? player.nearest : -1;

    // for (let i = 0; i < asteroids.length; i++) {
    //     const a = asteroids[i];
    //     const d = dist(
    //         player.g.position.x,
    //         player.g.position.y,
    //         a.position.x,
    //         a.position.y
    //     );
    //     if (d < minDist) {
    //         minDist = d;
    //         minIndex = i;
    //     }
    // }
    // if (!multikey.keys.has(' ')) {
    //     player.nearest = minIndex;
    // }
    // if (multikey.keys.has(' ')) {
    //     const r = Math.max(
    //         dist(
    //             player.g.position.x,
    //             player.g.position.y,
    //             asteroids[player.nearest].x,
    //             asteroids[player.nearest].y
    //         ) * 2,
    //         0.05
    //     );
    //     const dx = asteroids[player.nearest].x - player.g.position.x;
    //     const dy = asteroids[player.nearest].y - player.g.position.y;
    //     const invsqrr = 1 / (r * r);
    //     const g = 30;
    //     player.plusdx(g * dx * invsqrr);
    //     player.plusdy(g * dy * invsqrr);
    // }

    // // const [curr] = lines.removeChildren();
    // let close, curr;
    // if (lines.children.length === 1) {
    //     [curr] = lines.removeChildren();
    //     close = new PIXI.Graphics();
    // } else {
    //     [curr, close] = lines.removeChildren();
    // }

    // // console.log(JSON.stringify(player, ['v', 'a', 'nearest']));

    // const closel = close as PIXI.Graphics;
    // closel.clear();
    // closel.lineStyle(1, 0xffffff, 0.5);
    // closel.moveTo(player.g.position.x, player.g.position.y);
    // closel.lineTo(asteroids[minIndex].x, asteroids[minIndex].y);
    // lines.addChild(closel);

    // const currl = curr as PIXI.Graphics;
    // currl.clear();
    // currl.lineStyle(multikey.keys.has(' ') ? 3 : 1, 0xffffff, 1);
    // currl.moveTo(player.g.position.x, player.g.position.y);
    // currl.lineTo(asteroids[player.nearest].x, asteroids[player.nearest].y);

    // lines.addChild(currl);

    // // console.log(asteroids[0].position.x);

    // // console.log(`${minDist} ${minIndex}`);

    // player.g.rotation = player.a;

    fpsMeter.updateTime();

    /* ***************************** */
    /* Update your Game Objects here */
    /* ***************************** */
} // update

function addPlayer(player: Player): void {
    const path: PIXI.Point[] = [
        new PIXI.Point(10, 0),
        new PIXI.Point(-5, 5),
        new PIXI.Point(0, 0),
        new PIXI.Point(-5, -5),
        new PIXI.Point(10, 0),
    ];
    const poly = new PIXI.Graphics();
    poly.lineStyle(1, 0xffffff);
    poly.beginFill(0xffffff);
    poly.drawPolygon(path);
    poly.endFill();
    // player = new Player(poly);
    poly.position.x = player.p.x;
    poly.position.y = player.p.y;
    // player.g.position.x = engine.renderer.width / 2;
    // player.g.position.y = engine.renderer.height / 2;

    engine.stage.addChild(poly);
}

function addOtherPlayer(player: Player): void {
    const path: PIXI.Point[] = [
        new PIXI.Point(10, 0),
        new PIXI.Point(-5, 5),
        new PIXI.Point(0, 0),
        new PIXI.Point(-5, -5),
        new PIXI.Point(10, 0),
    ];
    const poly = new PIXI.Graphics();
    poly.lineStyle(1, 0xffffff);
    poly.beginFill(0xffffff);
    poly.drawPolygon(path);
    poly.endFill();
    // player = new Player(poly);
    poly.position.x = player.p.x;
    poly.position.y = player.p.y;
    // player.g.position.x = engine.renderer.width / 2;
    // player.g.position.y = engine.renderer.height / 2;
    poly.name = player.id;
    // engine.stage.addChild(poly);
    otherplayers.addChild(poly);
    console.log(engine.stage.children);
}

function create(): void {
    /* ***************************** */
    /* Create your Game Objects here */
    /* ***************************** */

    /* Player */

    multikey = new Multikey();

    // asteroids = [];
    // for (let i = 0; i < 20; i++) {
    //     const a = new PIXI.Graphics();
    //     a.beginFill(0xffffff, 0.5);
    //     const x = randInt(engine.renderer.width);
    //     const y = randInt(engine.renderer.height);
    //     a.drawCircle(0, 0, 10);
    //     a.position.x = x;
    //     a.position.y = y;
    //     a.endFill();
    //     asteroids.push(a);
    //     engine.stage.addChild(a);
    // }

    lines = new PIXI.Container();
    engine.stage.addChild(lines);
    lines.addChild(new PIXI.Graphics());
    lines.addChild(new PIXI.Graphics());

    /* FPS */
    const fpsMeterItem = document.createElement('div');
    fpsMeterItem.classList.add('fps');
    engine.container.appendChild(fpsMeterItem);

    fpsMeter = new FpsMeter(() => {
        fpsMeterItem.innerHTML =
            'FPS: ' + fpsMeter.getFrameRate().toFixed(2).toString();
    });
    otherplayers = new PIXI.Container();
    engine.stage.addChild(otherplayers);

    socket = io();
    socket.on('currentPlayers', (players: Record<string, Player>) => {
        console.log(players);
        Object.keys(players).forEach(function (id) {
            if (players[id].id === socket.id) {
                addPlayer(players[id]);
            } else {
                addOtherPlayer(players[id]);
            }
        });
    });

    socket.on('newPlayer', function (playerInfo: Player) {
        addOtherPlayer(playerInfo);
    });

    socket.on('disconnect', function (playerId: string) {
        otherplayers.children.forEach(function (otherPlayer) {
            if (playerId === otherPlayer.name) {
                otherPlayer.destroy();
            }
        });
    });

    setInterval(update, 1000.0 / engine.fpsMax);
    render();
} // create

window.onload = (): void => {
    create();
}; // load
