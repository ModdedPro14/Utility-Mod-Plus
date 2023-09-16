import { world } from "@minecraft/server";
export class EntityHurt {
    on(callback) {
        world.afterEvents.entityHurt.subscribe((data) => {
            callback(data);
        });
        return this;
    }
}
