import { ItemStack } from '@minecraft/server';
export class item {
    /**
     * Sets the lore of the item the players holding
     * @param {any} player The player
     * @param {any} lore The lore to set
     * @returns 
     */
    setLore(player, lore = []) {
        const container = player.getComponent("inventory").container, item = container.getItem(player.selectedSlot);
        if (!item)
            return player.response.error('You must hold an item');
        item.setLore(lore);
        container.setItem(player.selectedSlot, item);
    }
    /**
     * Sets the name of the item the players holding
     * @param {any} player The player
     * @param {any} nameTag The name to set
     * @returns 
     */
    setName(player, nameTag = []) {
        const container = player.getComponent("inventory").container, item = container.getItem(player.selectedSlot);
        if (!item)
            return player.response.error('You must hold an item');
        item.nameTag = nameTag;
        container.setItem(player.selectedSlot, item);
    }
    /**
     * Repairs an item
     * @param {any} item The item to repair
     * @returns 
     */
    repair(item) {
        const newItem = new ItemStack(item.typeId, item.amount);
        newItem.nameTag = item.nameTag;
        newItem.getComponents = item.getComponents;
        newItem.setLore(item.getLore());
        newItem.getComponent('enchantments').enchantments = item.getComponent('enchantments').enchantments;
        return newItem;
    }
    /**
     * Gets an items name
     * @param {any} item The item 
     * @param {boolean} nameTag Include nametag of the item
     * @returns 
     */
    getItemName(item, nameTag = true) {
        return nameTag ? item.nameTag ?? item.typeId.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ") : item.typeId.split(":")[1].split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ");
    }
    /**
     * Gets an items data
     * @param {any} item The item 
     * @returns 
     */
    getItemData(item) {
        var _a;
        if (!item)
            return undefined;
        const itemData = {
            typeId: item.typeId,
            amount: item.amount,
            nameTag: item.nameTag,
            lore: item.getLore(),
            enchantments: [],
        };
        if (!item.hasComponent("enchantments"))
            return itemData;
        const enchants = (_a = item.getComponent('enchantments')) === null || _a === void 0 ? void 0 : _a.enchantments;
        if (enchants) {
            [...enchants].forEach(e => {
                itemData.enchantments.push({
                    id: e.type.id,
                    level: e.level,
                });
            });
        }
        return itemData;
    }
}
