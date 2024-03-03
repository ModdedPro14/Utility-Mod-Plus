import { world } from "@minecraft/server";
import { CX } from "../Vera";
export class BlockBreak {
    on(callback) {
        world.beforeEvents.playerBreakBlock.subscribe((data) => {
            callback(CX.player.convert(data.player), data);
        });
        return this;
    }
}
