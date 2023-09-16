import { Player, world } from "@minecraft/server";
import { CX } from "../CX";
export class ProjectileHit {
    on(callback) {
        world.afterEvents.projectileHit.subscribe((data) => {
            let src;
            if (data.source instanceof Player)
                src = CX.player.convert(data.source);
            callback(Object.assign(data, { src }));
        });
        return this;
    }
}
