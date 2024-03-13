import { Commands } from "./handlers/command.js";
import { scoreboard } from "./handlers/scoreboard.js";
import { factions } from "./handlers/faction.js";
import { Player } from './handlers/player.js'
import { system, world } from "@minecraft/server";
// import { events } from "./events/events.js";
// import config from "../config/main.js";
// import { item } from "./handlers/item.js";
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
                factionsPackage: new factions()
            }
        }
    //     /**
    //      * Extras class
    //      */
    //     this.extra = new Extra();
    //     /**
    //      * The item class
    //      */
    //     this.item = new item();
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
    // generateID() {
    //     const min = 1000000;
    //     const max = 9999999;
    //     let id;
    //     id = Math.floor(Math.random() * (max - min + 1)) + min;
    //     return id.toString();
    // }
}
// export const CX = new cx();




system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true;
});