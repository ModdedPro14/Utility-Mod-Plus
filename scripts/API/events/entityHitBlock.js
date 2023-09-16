import { world } from "@minecraft/server";
export class EntityHitBlock {
    on(callback) {
        world.afterEvents.entityHitBlock.subscribe((data) => {
            callback(data);
        });
        return this;
    }
}
