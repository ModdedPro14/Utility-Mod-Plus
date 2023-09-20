import { Player } from "@minecraft/server";
import { CX } from "../../API/CX";
CX.Build(CX.BuildTypes["@event"], {
    data: 'ProjectileHitEntity',
    executes(source, data) {
        if (data.getEntityHit()?.entity instanceof Player && source instanceof Player) {
            source.playSound("random.orb", { pitch: 0.5, volume: 0.4 });
        }
    }
});
