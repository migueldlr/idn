export interface Point {
    x: number;
    y: number;
}

export default class Player {
    public p: Point;
    public v: number;
    public a: number;
    public nearest: number;
    public id: string;

    constructor(id: string) {
        this.v = 0;
        this.a = 0;
        this.p = { x: Math.random() * 100, y: Math.random() * 100 };
        this.nearest = -1;
        this.id = id;
    }

    getvx(): number {
        return Math.cos(this.a) * this.v;
    }

    getvy(): number {
        return Math.sin(this.a) * this.v;
    }

    getvcart(): Point {
        return { x: this.getvx(), y: this.getvy() };
    }

    setvx(dx: number): void {
        const { y: dy } = this.getvcart();
        this.setva({ x: dx, y: dy });
    }

    setvy(dy: number): void {
        const { x: dx } = this.getvcart();
        this.setva({ x: dx, y: dy });
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
