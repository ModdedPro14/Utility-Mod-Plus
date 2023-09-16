import { world } from "@minecraft/server";
export class PlayerLog {
    constructor() {
        this.data = new Map();
        this.events = {
            playerLeave: world.afterEvents.playerLeave.subscribe((data) => this.data.delete(data.playerName))
        };
    }
    set(player, value) {
        this.data.set(player.name, value);
    }
    get(player) {
        return this.data.get(player.name);
    }
    delete(player) {
        this.data.delete(player.name);
    }
}
PlayerLog.data = null;
