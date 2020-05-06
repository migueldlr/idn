import { Graphics, Point } from 'pixi.js';

export class Player {
    public v: number;
    public a: number;
    public g: Graphics;
    public nearest: number;

    constructor(g: Graphics) {
        this.v = 0;
        this.a = 0;
        this.g = g;
        this.nearest = -1;
    }

    getvx(): number {
        return Math.cos(this.a) * this.v;
    }

    getvy(): number {
        return Math.sin(this.a) * this.v;
    }

    getvcart(): Point {
        return new Point(this.getvx(), this.getvy());
    }

    setvx(dx: number): void {
        const { y: dy } = this.getvcart();
        this.setva(new Point(dx, dy));
    }

    setvy(dy: number): void {
        const { x: dx } = this.getvcart();
        this.setva(new Point(dx, dy));
    }

    setva(vcomp: Point): void {
        const { x, y } = vcomp;
        this.v = Math.hypot(x, y);
        this.a = Math.atan2(y, x);
    }

    plusdx(ddx: number): void {
        this.setvx(this.getvx() + ddx);
    }

    plusdy(ddy: number): void {
        this.setvy(this.getvy() + ddy);
    }
}
