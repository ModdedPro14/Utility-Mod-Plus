import { world } from "@minecraft/server";
import { CX } from "../CX";
export class BlockPlace {
    on(callback) {
        world.beforeEvents.playerPlaceBlock.subscribe((data) => {
            callback(CX.player.convert(player), data);
        });
        return this;
    }
}