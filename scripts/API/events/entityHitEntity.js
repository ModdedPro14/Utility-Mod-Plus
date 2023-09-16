import { world } from "@minecraft/server";
export class EntityHitEntity {
    on(callback) {
        world.afterEvents.entityHitEntity.subscribe((data) => {
            callback(data);
        });
        return this;
    }
}
