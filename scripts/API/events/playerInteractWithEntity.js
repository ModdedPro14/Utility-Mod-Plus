import { Player, world } from "@minecraft/server";
import { CX } from "../CX";
export class PlayerInteractWithEntity {
    on(callback) {
        world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
            const interaction = CX.player.convert(data.player)
            let interacted = data.target 
            if (data.target instanceof Player) interacted = CX.player.convert(data.target) 
            callback(Object.assign(data, {
                interaction,
                interacted
            }));
        });
        return this;
    }
}
