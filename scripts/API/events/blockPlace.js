import { world } from "@minecraft/server";
import { CX } from "../Vera";
export class BlockPlace {
    on(callback) {
        world.beforeEvents.playerPlaceBlock.subscribe((data) => {
            callback(CX.player.convert(data.player), data);
        });
        return this;
    }
}