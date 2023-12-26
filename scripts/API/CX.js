import { Commands } from "./handlers/command.js";
import { scoreboard } from "./handlers/scoreboard.js";
import { factions } from "./handlers/faction.js";
import player from "./handlers/player.js";
import { system, world } from "@minecraft/server";
import { events } from "./events/events.js";
import config from "../config/main.js";
import { item } from "./handlers/item.js";
import { Logs } from "./logger.js";
import { Extra } from "./extra.js";
import { MessageForm } from "./handlers/forms/MessageFormData.js";
import { ActionForm } from "./handlers/forms/ActionFormData.js";
import { ModalForm } from "./handlers/forms/ModalFormData.js";
import { Enchantment } from "./handlers/enchantment.js";
import { ChestForm } from "./handlers/forms/ChestFormData.js";
import { Databases } from "./handlers/databases.js";

class cx {
    /**
     * CX service manager
     */
    constructor() {
        /**
         * The main command handler
         */
        this.command = Commands;
        /**
         * Scoreboard manager
         */
        this.scoreboard = new scoreboard();
        /**
         * Factions class
         */
        this.factions = new factions();
        /**
         * The player API class
         */
        this.player = player;
        /**
         * Extras class
         */
        this.extra = new Extra();
        /**
         * The item class
         */
        this.item = new item();
        /**
         * The logging system
         */
        this.log = Logs;
        /**
         * Builds a message form
         */
        this.messageForm = MessageForm;
        /**
         * Builds a action form
         */
        this.actionForm = ActionForm;
        /**
         * Builds a modal form
         */
        this.modalForm = ModalForm;
        /**
         * Builds a chest form
         */
        this.chestForm = ChestForm;
        /**
         * Enchantment class
         */
        this.enchantment = new Enchantment();
        /**
         * Building Types
         */
        this.BuildTypes = {
            /**
             * The command builder type
             * @param {{ data: CX.command, executes(any: CX.commandExecution) => void}} data Data
             */
            ['@command']: (data) => {
                if (data.executes) {
                    data.executes(data.data);
                    new this.command().register(data.data);
                }
            },
            /**
             * The event builder type
             * @param {{ data: EventType, executes(any: EventTypeExecution) => void}} data Data 
             * @returns 
             */
            ['@event']: (data) => {
                return new events[data.data]().on(data.executes);
            }
        };
    }
    /**
     * Send a message to everyone
     * @param {any} message 
     * @returns 
     */
    send(message) {
        return world.sendMessage(message);
    }
    /**
     * Builds an BuildType
     * @param {CX.BuildTypes} BuildType The build type
     * @param {{ data: any, executes: (any: BuildTypeExecution) => void}} callback The callback
     */
    Build(BuildType, callback) {
        BuildType(callback);
    }
    /**
     * Rewrites a key in the config and settings
     * @param {any} key The key to rewrite
     * @param {any} value The value 
     * @param {any} category The category if there is
     */
    overRide(key, value, category) {
        Databases.settings.write(key, value);
        if (!category) {
            const reWrite = system.runInterval(() => {
                config[key] = value;
                system.clearRun(reWrite);
            }, 1);
        } else {
            const reWrite = system.runInterval(() => {
                config[category][key] = value;
                system.clearRun(reWrite);
            }, 1);
        }
    }
    /**
     * Generate a random ID
     * @returns {number}
     */
    generateID() {
        const min = 1000000;
        const max = 9999999;
        let id;
        id = Math.floor(Math.random() * (max - min + 1)) + min;
        return id.toString();
    }
}
export const CX = new cx();

system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true;
});