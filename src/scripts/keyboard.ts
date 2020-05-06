interface Key {
    value: string;
    isDown: boolean;
    isUp: boolean;
    press?: () => void;
    release?: () => void;
    downHandler?: (e: KeyboardEvent) => void;
    upHandler?: (e: KeyboardEvent) => void;
    unsubscribe?: () => void;
}

export function keyboard(value: string): Key {
    const key: Key = {
        value: value,
        isDown: false,
        isUp: true,
        press: undefined,
        release: undefined,
    };

    //The `downHandler`
    key.downHandler = (event: KeyboardEvent): void => {
        if (event.key === key.value) {
            if (key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = (event): void => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener('keydown', downListener, false);
    window.addEventListener('keyup', upListener, false);

    // Detach event listeners
    key.unsubscribe = (): void => {
        window.removeEventListener('keydown', downListener);
        window.removeEventListener('keyup', upListener);
    };

    return key;
}
