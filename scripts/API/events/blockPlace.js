import { world } from "@minecraft/server";
import { CX } from "../CX";
export class BlockPlace {
    on(callback) {
        world.afterEvents.blockPlace.subscribe(({ player, block, dimension }) => {
            const interaction = CX.player.convert(player);
            callback(interaction, { block: block, dimension: dimension});
        });
        return this;
    }
}