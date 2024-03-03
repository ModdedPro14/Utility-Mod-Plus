import { world } from "@minecraft/server";
import { CX } from "../Vera";
export class ItemUseOn {
    on(callback) {
        world.beforeEvents.itemUseOn.subscribe((data) => {
            const interaction = CX.player.convert(data.source);
            callback(Object.assign(data, {
                interaction
            }));
        });
        return this;
    }
}
