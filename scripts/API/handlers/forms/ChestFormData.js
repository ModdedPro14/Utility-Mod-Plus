import { ActionFormData } from '@minecraft/server-ui';
import { system } from '@minecraft/server';
import { typeIdToID } from "./typeIds.js";

const number_of_1_16_100_items = 0;
const sizes = {
    small: [`§c§h§e§s§t§s§m§a§l§l§r`, 8],
    medium: [`§c§h§e§s§t§m§e§d§i§u§m§r`, 27],
    large: [`§c§h§e§s§t§l§a§r§g§e§r`, 54]
};

export class ChestForm {
    /**
     * ChestForm Builder service manager
     * @param {'small' | 'medium' | 'large'} size The size of the chest form
     */
    constructor(size = 'medium') {
        this.data = {
            size: sizes[size],
            title: sizes[size][0],
            buttons: []
        };
        for (let i = 0; i < this.data.size[1]; i++)
            this.data.buttons.push(['', undefined]);
    }
    /**
     * Sets the size of the chest form
     * @param {'small' | 'medium' | 'large'} size The size to set
     * @returns 
     */
    setSize(size) {
        this.data.title = sizes[size][0];
        this.data.size = sizes[size]
        for (let i = 0; i < this.data.size[1]; i++) this.data.buttons.push(['', undefined]);
        return this;
    }
    /**
     * Sets the title of the chest form
     * @param {any} title The title to set
     * @returns 
     */
    setTitle(title) {
        this.data.title += title;
        return this;
    }
    /**
     * Adds a button to the chest form
     * @param {number} slot The slot to add too
     * @param {any} itemName The item name
     * @param {any[]} itemDesc The description of the item 
     * @param {string} iconPath The icon of the item
     * @param {number} stackSize The amount of the item
     * @param {boolean} enchanted If the item is enchanted
     * @returns 
     */
    addButton(slot, itemName, itemDesc, iconPath, stackSize = 1, enchanted = false) {
        const ID = typeIdToID.get(iconPath.includes(':') ? iconPath : 'minecraft:' + iconPath);
        this.data.buttons.splice(slot, 1, [`stack#${Math.min(Math.max(stackSize, 1) || 1, 99).toString().padStart(2, '0')}§r${itemName ?? ''}§r${itemDesc?.length ? `\n§r${itemDesc.join('\n§r')}` : ''}`,
            (((ID + (ID < 256 ? 0 : number_of_1_16_100_items)) * 65536) + (!!enchanted * 32768)) || iconPath
        ]);
        return this;
    }
    /**
     * Adds a pattren to the chest form
     * @param {'top' | 'bottom' | 'circle'} type The type of the pattren
     * @param {any} itemName The item name 
     * @param {any[]} itemDsc The description of the item 
     * @param {string} iconPath The icon of the item
     * @param {number[]} exculdeSlots The slots to exculde from filling
     * @param {number} stackSize The amount of the item
     * @param {boolean} enchanted If the item is enchanted
     * @returns 
     */
    addPattren(type, itemName, itemDsc, iconPath, exculdeSlots = [], stackSize = 1, enchanted = false) {
        if (type == 'top') {
            for (let i = 0; i < 9; i++) {
                if (exculdeSlots.includes(i))
                    continue;
                this.addButton(i, itemName, itemDsc, iconPath, stackSize, enchanted);
            }
        }
        else if (type == 'circle') {
            this.addPattren('top', itemName, itemDsc, iconPath, exculdeSlots, stackSize, enchanted);
            this.addPattren('bottom', itemName, itemDsc, iconPath, exculdeSlots, stackSize, enchanted);
            !exculdeSlots.includes(9) && this.addButton(9, itemName, itemDsc, iconPath, stackSize, enchanted);
            !exculdeSlots.includes(17) && this.addButton(17, itemName, itemDsc, iconPath, stackSize, enchanted);
        }
        else if (this.data.size[1] == 27 && type == 'bottom') {
            for (let i = 18; i < 27; i++) {
                if (exculdeSlots.includes(i))
                    continue;
                this.addButton(i, itemName, itemDsc, iconPath, stackSize, enchanted);
            }
        }
        else {
            for (let i = 45; i < 54; i++) {
                if (exculdeSlots.includes(i)) continue;
                this.addButton(i, itemName, itemDsc, iconPath, stackSize, enchanted);
            }
        }
        return this;
    }
    /**
     * Force show the chest form
     * @param {any} player The player to force show too
     * @param {any} callback Callback
     * @param {number} timeout Amount of ticks to wait before stopping 
     * @returns 
     */
    async force(player, callback, timeout = Infinity) {
        const startTick = system.currentTick;
        while ((system.currentTick - startTick) < timeout) {
            const form = new ActionFormData()
                .title(this.data.title);
            this.data.buttons.forEach(button => {
                form.button(button[0], button[1]?.toString());
            });
            const response = await (form.show(player));
            if (response.cancelationReason !== "UserBusy") {
                callback(response);
                return response;
            }
        }
        player.response.error('ChestForm cancelled. Reason: timedOut');
    }
    /**
     * Shows the chest form
     * @param {any} player The player to show too
     * @param {any} callback Callback
     * @returns 
     */
    show(player, callback) {
        const form = new ActionFormData()
            .title(this.data.title);
        this.data.buttons.forEach(button => {
            form.button(button[0], button[1]?.toString());
        });
        return form.show(player).then((response) => {
            callback(response);
        });
    }
}
