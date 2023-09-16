import { world } from "@minecraft/server";
import { CX } from "../CX";
export class BlockBreak {
    on(callback) {
        world.afterEvents.blockBreak.subscribe(({ player, block, brokenBlockPermutation, dimension }) => {
            const interaction = CX.player.convert(player);
            callback(interaction, { block: block, brokenBlockPermutation: brokenBlockPermutation, dimension: dimension });
        });
        return this;
    }
}
