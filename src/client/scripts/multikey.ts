export default class Multikey {
    public keys: Set<string>;
    public downEvt: Record<string, () => void>;

    constructor() {
        this.keys = new Set<string>();
        this.downEvt = {};
        window.addEventListener('keydown', (e) => this.addDown(e), false);
        window.addEventListener('keyup', (e) => this.removeDown(e), false);
    }

    addDown(event: KeyboardEvent): void {
        this.keys.add(event.key);
    }

    removeDown(event: KeyboardEvent): void {
        this.keys.delete(event.key);
    }
}
