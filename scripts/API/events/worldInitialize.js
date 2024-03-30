import { world } from "@minecraft/server";
export class WorldInitialize {
    on(callback) {
        world.afterEvents.worldInitialize.subscribe((data) => {
            callback(data);
        });
        return this;
    }
}