import * as PIXI from 'pixi.js';

interface EngineParams {
    containerId: string;
    canvasW: number;
    canvasH: number;
    fpsMax: number;
}

export default class Engine {
    public container: HTMLElement;
    public loader: PIXI.Loader;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public graphics: PIXI.Graphics;
    public fpsMax: number;

    constructor(params: EngineParams) {
        this.loader = PIXI.Loader.shared;
        this.renderer = PIXI.autoDetectRenderer({
            width: params.canvasW,
            height: params.canvasH,
            antialias: true,
        });
        this.stage = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.fpsMax = params.fpsMax;

        this.container = params.containerId
            ? document.getElementById(params.containerId) || document.body
            : document.body;
        this.container.appendChild(this.renderer.view);
    } // constructor
} // Engine
