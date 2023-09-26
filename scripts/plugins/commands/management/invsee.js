import { CX } from "../../../API/CX";
import { EquipmentSlot } from "@minecraft/server";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('invsee')
    .setDescription('See a players inventory')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: false }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            const container = player.getComponent('inventory').container, equpiement = player.getComponent('equippable');
            if (container.size == container.emptySlotsCount) return sender.response.error(`${player.name}'s §cinventory is empty`);
            let slot = 0, items = [];
            const form = new CX.chestForm('large')
            .setTitle(`${player.name}'s §rInventory`);
            sender.response.send('Close the chat within 10 secondes');
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (!item) continue;
                const data = CX.item.getItemData(item);
                form.addButton(slot, CX.item.getItemName(item), [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);
                items.push({
                    slot: i,
                    item: item,
                    itemName: CX.item.getItemName(item),
                });
                slot++;
            }
            const armor = [
                ['Head', equpiement.getEquipment(EquipmentSlot.Head)],
                ['Chest', equpiement.getEquipment(EquipmentSlot.Chest)],
                ['Legs', equpiement.getEquipment(EquipmentSlot.Legs)],
                ['Feet', equpiement.getEquipment(EquipmentSlot.Feet)],
                ['Offhand', equpiement.getEquipment(EquipmentSlot.Offhand)]
            ];
            let n = 45, armorSlots = [];
            for (let i = 0; i < 5; i++) {
                if (!armor[i][1]) continue;
                form.addButton(n, CX.item.getItemName(armor[i][1]), [CX.item.getItemData(armor[i][1]).enchantments.length ? CX.item.getItemData(armor[i][1]).enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', CX.item.getItemData(armor[i][1]).lore], CX.item.getItemData(armor[i][1]).typeId, CX.item.getItemData(armor[i][1]).amount, !CX.item.getItemData(armor[i][1]).enchantments.length ? false : true);
                items.push({
                    slot: armor[i][0],
                    item: armor[i][1],
                    itemName: CX.item.getItemName(armor[i][1]),
                });
                armorSlots.push([armor[i][0], n]);
                n++;
            }
            form.force(sender, (res) => {
                if (res.canceled) return;
                if (!res.selection == 0 && !res.selection) return;
                let selection = items[res.selection];
                for (let i = 0; i < armorSlots.length; i++) {
                    if (!armorSlots[i].includes(res.selection)) continue;
                    selection = items.find(a => isNaN(a.slot) && a.slot == armorSlots[i][0]);
                }
                new CX.chestForm('small')
                .setTitle(selection.itemName)
                .addButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red')
                .addButton(3, '§cTake Item', ['§6Do You want to take this item?'], 'textures/blocks/glass_lime')
                .show(sender, (result) => {
                    if (result.canceled) return;
                    if (result.selection == 3) {
                        const inventory = sender.getComponent('inventory').container;
                        if (container.emptySlotsCount < 1) return sender.response.error('You do not have enough space to take this item');
                        inventory.addItem(selection.item);
                        if (isNaN(selection.slot)) {
                            equpiement.setEquipment(EquipmentSlot[selection.slot]);
                            sender.response.send(`You have taken the item ${selection.itemName} from ${player.name}`);
                            delete items[res.selection];
                        } else {
                            container.setItem(selection.slot);
                            sender.response.send(`You have taken the item ${selection.itemName} from ${player.name}`);
                            delete items[res.selection];
                        }
                    }
                });
            }, 220);
        });
    }
})