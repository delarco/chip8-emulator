import { TypedEvent } from "./typed-event";

export class GamepadManager {

    public readonly connected = new TypedEvent<Gamepad>();
    public readonly disconnected = new TypedEvent<Gamepad>();

    constructor() {

        window.addEventListener("gamepadconnected", (e) => this.gamepadHandler(e, true), false);
        window.addEventListener("gamepaddisconnected", (e) => this.gamepadHandler(e, false), false);
    }

    private gamepadHandler(event: GamepadEvent, connecting: boolean) {

        const gamepad = event.gamepad;

        if (connecting) this.connected.emit(gamepad)
        else this.disconnected.emit(gamepad);
    }

    public getGamepad(index: number): Gamepad | null {

        return navigator.getGamepads().find(g => g?.index == index) || null;
    }
}
