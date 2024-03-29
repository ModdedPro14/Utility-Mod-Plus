import { CX } from "./Vera";
import { system, world, Vector } from "@minecraft/server";

let lastTick = Date.now(), tps = 20, timeArray = [];

system.runInterval(() => {
    if (timeArray.length === 20)
        timeArray.shift();
    timeArray.push(Math.round(1000 / (Date.now() - lastTick) * 100) / 100);
    tps = timeArray.reduce((a, b) => a + b) / timeArray.length;
    lastTick = Date.now();
});

export class Extra {
    
    /**
     * Gets the worlds TPS
     * @returns 
     */
    tps() {
        return tps.toFixed(1);
    }
    
    /**
     * Broadcast a message to the world
     * @param {any} message 
     * @returns 
     */
    broadcast(message) {
        return CX.send(`§8[§cBroadcast§8] §r§6${message}`);
    }
    /**
     * Gets a random number
     * @param {number} min The min amount
     * @param {number} max The max amount
     * @returns 
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
    /**
     * An indicator...
     * @param {any} player The player
     * @param {any} text The text to display
     * @param {any} vector Vector velocity
     * @param {any} offset Offset stuff
     */
    indicator(player, text, vector = [0, 0.1, 0], offset = [random(-1, 1), -0.5, random(-1, 1)]) {
        const { x, y, z } = player.location;
        const h = world.getDimension(`overworld`).spawnEntity('mod:damage_entity', new Vector(x + offset[0], y + offset[1], z + offset[2]));
        h.nameTag = text;
        h.applyImpulse({ x: vector[0], y: vector[1], z: vector[2] });
    }
    
}
