import { Commands } from "./handlers/command.js";
import { scoreboard } from "./handlers/scoreboard.js";
import { factions } from "./handlers/faction.js";
import { Player } from './handlers/player.js'
import { system, world } from "@minecraft/server";
// import { events } from "./events/events.js";
// import config from "../config/main.js";
import { item } from "./handlers/item.js";
import { Logs } from "./logger.js";
// import { Extra } from "./extra.js";
import { MessageForm } from "./handlers/forms/MessageFormData.js";
import { ActionForm } from "./handlers/forms/ActionFormData.js";
import { ModalForm } from "./handlers/forms/ModalFormData.js";
// import { Enchantment } from "./handlers/enchantment.js";
import { ChestForm } from "./handlers/forms/ChestFormData.js";
// import { Databases } from "./handlers/databases.js";
import { Event } from "./events/events.js";


export class Vera {
        /**
         * Main package manager
         */
        static JAR = {
            /**
             * Gets a package
             * @param {Vera.Engine['new']} Package The package to get
             */
            getPackage: (Package) => {
                /**
                 * Represents a package from Vera.Engine
                 * @typedef {Vera.Engine['new'][keyof typeof Vera.Engine.new]} packageData
                 */
                return {
                    /**
                     * Unpack the package
                     * @param {(any: InstanceType<packageData>) => void} data Package data
                     */
                    unpack: (data) => {
                        if (Package == Vera.Engine.new.commandPackage) {
                            const pkg = new Package()
                            data(pkg)
                            return new Package().register(pkg)
                        } else return data(new Package())
                    }
                }
            },
            /**
             * Gets a raw package
             * @param {Vera.Engine['raw'][keyof typeof Vera.Engine.raw ]} Package The package to get
             */
            getRawPackage: (Package) => {
                return Package
            }
        }
        static Engine = {
            new: {
                commandPackage: Commands,
                actionFormPackage: ActionForm,
                modalFormPackage: ModalForm,
                messageFormPackage: MessageForm,
                chestFormPackage: ChestForm,
                logPackage: Logs,
                eventPackage: Event
            },
            raw: {
                playerPackage: new Player(),
                scoreboardPackage: new scoreboard(),
                factionsPackage: new factions(),
                itemPackage: new item()
            }
        }
    //     /**
    //      * Extras class
    //      */
    //     this.extra = new Extra();
    //     /**
    //      * Enchantment class
    //      */
    //     this.enchantment = new Enchantment();
    // /**
    //  * Send a message to everyone
    //  * @param {any} message 
    //  * @returns 
    //  */
    // send(message) {
    //     return world.sendMessage(message);
    // }
    // /**
    //  * Builds an BuildType
    //  * @param {CX.BuildTypes} BuildType The build type
    //  * @param {{ data: any, executes: (any: BuildTypeExecution) => void}} callback The callback
    //  */
    // Build(BuildType, callback) {
    //     BuildType(callback);
    // }
    // /**
    //  * Rewrites a key in the config and settings
    //  * @param {any} key The key to rewrite
    //  * @param {any} value The value 
    //  * @param {any} category The category if there is
    //  */
    // overRide(key, value, category) {
    //     Databases.settings.write(key, value);
    //     if (!category) {
    //         const reWrite = system.runInterval(() => {
    //             config[key] = value;
    //             system.clearRun(reWrite);
    //         }, 1);
    //     } else {
    //         const reWrite = system.runInterval(() => {
    //             config[category][key] = value;
    //             system.clearRun(reWrite);
    //         }, 1);
    //     }
    // }
    // /**
    //  * Generate a random ID
    //  * @returns {number}
    //  */
    static generateID() {
        const min = 1000000;
        const max = 9999999;
        let id;
        id = Math.floor(Math.random() * (max - min + 1)) + min;
        return id.toString();
    }
    /**
     * Converts a number to a metric number
     * @param {number} value The number to convert
     * @returns 
     */
    static parseNumber(value) {
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
     * Convert a number into a roman numeral number
     * @param {number} num 
     * @returns 
     */
    static convertToRoman(num) {
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
     * Parse a time
     * @param {*} value The value to parse
     * @returns 
     */
    static parseTime(value) {
        let seconds = value / 1000
        const hours = parseInt(seconds / 3600)
        seconds %= 3600
        const minutes = parseInt(seconds / 60)
        return `${hours}h ${minutes}m`
    }
}

system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true;
});