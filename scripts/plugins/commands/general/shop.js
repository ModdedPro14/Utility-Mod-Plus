import { ItemDB } from "../../../API/Item Database/main";
import { CX } from "../../../API/CX";
import config from "../../../config/main";

const shopItems = new ItemDB('shopItems');

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('shop')
    .setDescription('A shop system')
    .setCategory('general'),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send('Close the chat within 10 secondes');
            if (sender.permission.hasPermission('admin')) {
                const form = new CX.chestForm('medium')
                form.setTitle('Shop')
                .addPattren('circle', '', [], 'textures/blocks/glass_black', [27])
                .addButton(14, '§eAdd Item', ['§6Add an item to the shop §c(admin only)'], 'minecraft:stick', 1, true)
                .addButton(12, '§aShop', ['§6All items in the shop'], 'minecraft:golden_carrot', 1, true)
                .addButton(27, '§cClose', ['§6Close this page'], 'minecraft:barrier');
                form.force(sender, (res) => {
                    if (res.selection == 14) {
                        new CX.modalForm()
                        .setTitle('§eAdd An Item')
                        .addTextField('§6Price §c(Sells the item ur holding only)', "100", "0")
                        .show(sender, (result) => {
                            if (result.canceled) return;
                            if (isNaN(result.formValues[0])) return sender.response.error('The price must be a number');
                            if (`${result.formValues[0]}`.startsWith('-')) return sender.response.error('The price cant be less than 0');
                            const inventory = sender.getComponent('inventory').container;
                            if (!inventory.getItem(sender.selectedSlot)) return sender.response.error('You must hold the item to add to the shop');
                            if (config.allCbes.includes(inventory.getItem(sender.selectedSlot).typeId.replace('mincraft:'))) return sender.response.error('You cannot add that item to the shop');
                            shopItems.writeItem(inventory.getItem(sender.selectedSlot), {
                                price: result.formValues[0],
                                itemName: CX.item.getItemName(inventory.getItem(sender.selectedSlot), false),
                            });
                            sender.response.send(`Successfully sold the item ${CX.item.getItemName(inventory.getItem(sender.selectedSlot), false)} for ${result.formValues[0]}`);
                        });
                    } else if (res.selection == 12) shop(1, sender)            
                }, 220)
            } else shop(1, sender)
        })
    }
})
const shop = (page, sender) => {
    const aShopItems = shopItems.allIDs(), pages = Math.ceil(aShopItems.length / 45), items = aShopItems.slice((page - 1) * 45, (page - 1) * 45 + 45)
    if (!aShopItems.length) return (new CX.messageForm()
    .setTitle('§cNo Shop Items')
    .setBody('§4There are no items in the shop to show!')
    .setButton2('§cClose')
    .setButton1('§aOk')
    .force(sender, (_) => { }, 220))
    if (!sender.permission.hasPermission('admin')) {
        const form = new CX.chestForm('large')
        .setTitle('Shop')
        .addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
        if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
        if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
        form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
        items.forEach((item, i) => {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, item.data.itemName, [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Price: §a$${CX.extra.parseNumber(Number(item.data.price))}`], data.typeId, data.amount, !data.enchantments.length ? false : true);    
        })
        form.force(sender, (res) => {
            if (res.selection == 47 && page > 1) shop(page - 1, sender)
            else if (res.selection == 51 && page < pages) shop(page + 1, sender)
            else if (res.selection <= items.length) {
                const selection = items[res.selection]
                new CX.chestForm('small')
                .setTitle(selection.data.itemName)
                .addButton(3, '§aBuy', ['§6Do you want to buy this item?'], 'textures/blocks/glass_lime')
                .addButton(5, '§cClose', ['§6Close this page'], 'textures/blocks/glass_red')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        if (sender.score.getScore(config.currency) < selection.data.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§l to buy this item`);
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                        sender.score.removeScore(config.currency, selection.data.price);
                        inventory.addItem(selection.item);
                        sender.response.send(`You have succssfully bought the item ${selection.data.itemName}`);
                    }
                });
            }
        }, 220)
    } else {
        const form = new CX.chestForm('large')
        .setTitle('Shop')
        .addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
        if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
        if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
        form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
        items.forEach((item, i) => {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, item.data.itemName, [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Price: §a$${CX.extra.parseNumber(Number(item.data.price))}`], data.typeId, data.amount, !data.enchantments.length ? false : true);    
        })
        form.show(sender, (result) => {
            if (result.selection == 47 && page > 1) shop(page - 1, sender)
            if (result.selection == 51 && page < pages) shop(page + 1, sender)
            if (result.selection <= items.length) {
                const selection = items[result.selection]
                if (!selection) return;
                new CX.chestForm('small')
                .setTitle(selection.data.itemName)
                .addButton(3, '§aBuy', ['§6Do you want to buy this item?'], 'textures/blocks/glass_lime')
                .addButton(5, '§cRemove', ['§6Do you want to remove this item?'], 'textures/blocks/glass_red')
                .show(sender, (ress) => {
                    if (ress.canceled) return;
                    if (ress.selection == 5) {
                        sender.response.send(`You have succssfully removed the item ${selection.data.itemName}`);
                        shopItems.deleteID(selection.ID)
                    } else if (ress.selection == 3) {
                        if (sender.score.getScore(config.currency) < selection.data.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§l to buy this item`);
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                        sender.score.removeScore(config.currency, selection.data.price);
                        inventory.addItem(selection.item);
                        sender.response.send(`You have succssfully bought the item ${selection.data.itemName}`);
                    }
                });
            }
        });
    }
}