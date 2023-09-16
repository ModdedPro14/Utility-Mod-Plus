import { world } from "@minecraft/server";
import config from "../config/main";
export class Logs {
    /**
     * Makes a new log
     * @param {{reason: any, translate: 'command' | 'AntiCheat', from: any, warn: boolean}} data The data
     */
    constructor(data) {
        if (data.translate == 'command') Logs.logs.push(`§6Command §4>> §c${data.from}§c Used the command: ${data.reason}`);
        else if (data.translate == 'AntiCheat') Logs.logs.push(`§6Anti cheat §4>> §c${data.from}§c Used: ${data.reason}`);
        if (data.warn) world.getPlayers({ tags: [config.adminTag] }).forEach(p => { p.response.send('§cA new log has been made', true, false); });
    }
}
Logs.logs = [];
