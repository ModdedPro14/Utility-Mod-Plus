import { Databases } from "./databases";
export class Enchantment {
    /**
     * Creates an enchantment
     * @param {any} info The info of the enchantment 
     * @returns 
     */
    create(info) {
        return Databases.enchantments.write(info.name, {
            name: info.name,
            description: info.description,
            equpiedOn: info.equpiedOn,
            maxLevel: info.maxLevel,
            event: info.event,
            tier: info.tier,
            command: info.command
        });
    }
    /**
     * Get the tier color
     * @param {any} tier The tier 
     * @returns 
     */
    getTierColor(tier) {
        if (tier == 'uncommon')
            return '§r§a';
        else if (tier == 'common')
            return '§r§7';
        else if (tier == 'epic')
            return '§r§d';
        else if (tier == 'legendary')
            return '§r§6';
        else if (tier == 'mythical')
            return '§r§4';
        else
            return;
    }
}
Enchantment.enchatments = [];
