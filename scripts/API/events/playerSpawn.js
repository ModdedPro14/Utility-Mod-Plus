import { world } from "@minecraft/server";
import { CX } from "../Vera";
export class PlayerSpawn {
    on(callback) {
        world.afterEvents.playerSpawn.subscribe(data => {
            const player = CX.player.convert(data.player);
            callback(Object.assign(player, {
                welcome() {
                    if (!player.hasTag('old')) {
                        CX.send(`§c${player.name}§r§7 has connected for the first time. Please welcome them`);
                        player.addTag('old');
                    }
                }
            }), data);
        });
        return this;
    }
}
