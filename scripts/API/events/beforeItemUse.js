import { world } from "@minecraft/server";
import { CX } from "../Vera";
export class ItemUse {
    on(callback) {
        world.beforeEvents.itemUse.subscribe((data) => {
            const interaction = CX.player.convert(data.source);
            callback(Object.assign(data, {
                interaction
            }));
        });
        return this;
    }
}
