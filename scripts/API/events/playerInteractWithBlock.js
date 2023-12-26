import { world } from "@minecraft/server";
import { CX } from "../CX";
export class PlayerInteractWithBlock {
    on(callback) {
        world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
            const interaction = CX.player.convert(data.player) 
            callback(Object.assign(data, {
                interaction
            }));
        });
        return this;
    }
}
