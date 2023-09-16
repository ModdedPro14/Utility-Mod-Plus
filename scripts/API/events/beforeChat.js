import { world } from "@minecraft/server";
import { CX } from "../CX";
export class Chat {
    on(callback) {
        world.beforeEvents.chatSend.subscribe(data => {
            const player = CX.player.convert(data.sender);
            const { message } = data;
            callback(player, {
                message: message,
                cancel() {
                    data.cancel = true;
                }
            });
        });
        return this;
    }
}
