import { world } from "@minecraft/server";
import { CX } from "../CX";
export class AfterBlockPlace {
    on(callback) {
        world.afterEvents.playerPlaceBlock.subscribe((data) => {
            callback(CX.player.convert(data.player), data);
        });
        return this;
    }
}