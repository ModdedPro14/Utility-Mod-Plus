import { world } from "@minecraft/server";
import { CX } from "../Vera";
export class AfterBlockBreak {
    on(callback) {
        world.afterEvents.playerBreakBlock.subscribe((data) => {
            callback(CX.player.convert(data.player), data);
        });
        return this;
    }
}
