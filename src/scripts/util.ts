export function randInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
    return Math.hypot(x2 - x1, y2 - y1);
}

export function invsqrt(x: number): number {
    return 1 / Math.sqrt(x);
}
