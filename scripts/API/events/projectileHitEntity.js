import { Player, world } from "@minecraft/server";
import { CX } from "../Vera";
export class ProjectileHitEntity {
    on(callback) {
        world.afterEvents.projectileHitEntity.subscribe((data) => {
            let src = data.source;
            if (data.source instanceof Player) src = CX.player.convert(data.source);
            callback(src, data);
        });
        return this;
    }
}
