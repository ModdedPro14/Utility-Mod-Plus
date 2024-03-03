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
     * Converts a number to a metric number
     * @param {number} value The number to convert
     * @returns 
     */
    parseNumber(value) {
        const types = ["", "k", "M", "B", "T", "P", "E", "Z", "Y"];
        let selectType = 0;
        let scaled = value;
        while (scaled >= 1000 && selectType < types.length - 1) {
            scaled /= 1000;
            selectType++;
        }
        return scaled.toFixed(1) + types[selectType];
    }
    /**
     * Gets the worlds TPS
     * @returns 
     */
    tps() {
        return tps.toFixed(1);
    }
    /**
     * Convert a number into a roman numeral number
     * @param {number} num 
     * @returns 
     */
    convertToRoman(num) {
        const roman = {
            M: 1000,
            CM: 900,
            D: 500,
            CD: 400,
            C: 100,
            XC: 90,
            L: 50,
            XL: 40,
            X: 10,
            IX: 9,
            V: 5,
            IV: 4,
            I: 1
        };
        let str = '';
        for (var i of Object.keys(roman)) {
            var q = Math.floor(num / roman[i]);
            num -= q * roman[i];
            str += i.repeat(q);
        }
        return str;
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
    /**
     * Parse a time
     * @param {*} value The value to parse
     * @returns 
     */
    parseTime(value) {
        let seconds = value / 1000
        const hours = parseInt(seconds / 3600)
        seconds %= 3600
        const minutes = parseInt(seconds / 60)
        return `${hours}h ${minutes}m`
    }
}
