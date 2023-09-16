import { Player } from "@minecraft/server";
import { CX } from "../../API/CX";
CX.Build(CX.BuildTypes["@event"], {
    data: 'ProjectileHit',
    executes(data) {
        if (data.getEntityHit()?.entity instanceof Player && data.src instanceof Player) {
            data.src.playSound("random.orb", { pitch: 0.5, volume: 0.4 });
        }
    }
});
