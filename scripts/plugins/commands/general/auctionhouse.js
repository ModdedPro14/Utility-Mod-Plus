import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { ItemDB } from "../../../API/Item Database/main";
import { Databases } from "../../../API/handlers/databases";

const auctionItems = new ItemDB('auctions'), expiredAh = new ItemDB('expiredAuctions')

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('auctionhouse')
    .setDescription('An auction house')
    .setCategory('general')
    .setAliases(['ah'])
    .firstArguments(['sell'], false)
    .addDynamicArgument('sell', 'sell', 'price')
    .addNumberArgument('price'),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (args.length) return;
            sender.response.send('Close the chat within 10 secondes');
            const form = new CX.chestForm()
            .setTitle('Auction House')
            .addPattren('circle', '', [], 'textures/blocks/glass_black', [26, 18, sender.permission.hasPermission('admin') ? 0 : undefined])
            .addButton(26, '§cClose', ['§6Close this page'], 'textures/blocks/barrier')
            .addButton(12, 'All Auctions', ['§6Shows all listed auctions'], 'minecraft:golden_carrot', 1, true)
            .addButton(14, 'My Auctions', ['§6Shows all auctions that you have listed'], 'minecraft:carrot', 1, true)
            .addButton(18, 'Expired Auctions', ['§6Shows all the auctions that have expired'], 'minecraft:nether_star', 1, true)
            if (sender.permission.hasPermission('admin')) form.addButton(0, 'Manage Auctions', ['§6Manage listed auctions §c(admin only)'], 'minecraft:amethyst_shard', 1, true)
            form.force(sender, (res) => {
                if (res.canceled) return;
                if (res.selection == 12) allAuctions(1, sender)
                else if (res.selection == 14) myAuctions(1, sender)
                else if (res.selection == 18) expiredAuctions(1, sender)
                else if (res.selection == 0 && sender.permission.hasPermission('admin')) manageAuctions(1, sender)
            }, 220);
        });
        ctx.executeArgument('sell', (sender, _, args) => {            
            if (auctionItems.allIDs().filter((k) => k.data.plrId == sender.id).length >= config.maxAuctions) return sender.response.error('You have made the maximum amount of auctions');
            const inventory = sender.getComponent('inventory').container;
            if (!inventory.getItem(sender.selectedSlot)) return sender.response.error('You must hold the item to auction');
            if (config.allCbes.includes(inventory.getItem(sender.selectedSlot).typeId.replace('mincraft:'))) return sender.response.error('You cannot auction that item');
            if (args[0] < 100) return sender.response.error('The price cant be less than 100')
            if (args[0] > 100000000) return sender.response.error('The price cant be bigger than 100000000');
            sender.response.send(`Successfully sold the item §c${CX.item.getItemName(inventory.getItem(sender.selectedSlot))} for ${args[0]}`);
            auctionItems.writeItem(inventory.getItem(sender.selectedSlot), {
                creator: sender.name,
                price: args[0],
                itemName: CX.item.getItemName(inventory.getItem(sender.selectedSlot), false),
                plrId: sender.id,
                date: Date.now(),
                expires: (new Date().getTime() + (48 * 3.6e+6)).toString(16)
            })
            inventory.setItem(sender.selectedSlot);
        });
    }
})

const allAuctions = (page, sender) => {
    const form = new CX.chestForm('large');
    const aAuctions = auctionItems.allIDs().sort((a, b) => a.data.date - b.data.date), pages = Math.ceil(aAuctions.length / 45)
    form.setTitle(`Auctions Page: ${page}/${pages}`);
    if (!auctionItems.allIDs().length) return (new CX.messageForm()
    .setTitle('No Auctions Available')
    .setBody('§cHmmm.. seems like theres no auctions to see, maybe add an auction using !ah sell <price>')
    .setButton2('§cClose')
    .setButton1('§aOk')
    .show(sender))
    form.addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        const data = CX.item.getItemData(item.item)
        form.addButton(i, item.data.itemName, [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Seller: §6${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n§7Expires: §6${CX.extra.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§7Price: §a$${CX.extra.parseNumber(Number(item.data.price))}`], data.typeId, data.amount, !data.enchantments.length ? false : true);
    })
    form.show(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 51 && page < pages) allAuctions(page + 1, sender)
        else if (result.selection == 47 && page > 1) allAuctions(page - 1, sender)
        else if (result.selection <= items.length) {
            const selection = items[result.selection]
            const form = new CX.chestForm('small')
            .setTitle(selection.data.itemName + ` Seller: ${selection.data.plrId == sender.id ? '§eYou' : selection.data.creator}`)
            .addButton(5, '§cCancel', ['§6Cancel Purchase'], 'textures/blocks/glass_red');
            if (selection.data.plrId == sender.id) {
                form.addButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(selection.item);
                        auctionItems.deleteID(selection.ID)
                        sender.response.send(`You have succssfully removed the item ${selection.data.itemName}`);
                    }
                });
            }
            else {
                form.addButton(3, '§aPurchase', ['§6Do You want to buy this item?'], 'textures/blocks/glass_lime')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        if (sender.score.getScore(config.currency) < selection.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§lto buy this item`);
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                        sender.score.removeScore(config.currency, selection.price);
                        inventory.addItem(selection.item);
                        auctionItems.deleteID(selection.ID)
                        sender.response.send(`You have succssfully bought the item ${selection.itemName}`);
                        Databases.auctionClaims.write(selection.plrId, selection.price);
                    }
                });
            }
        }
    });
}
const myAuctions = (page, sender) => {
    const form = new CX.chestForm('large');
    const aAuctions = auctionItems.allIDs().filter(i => i.data.plrId == sender.id).sort((a, b) => a.data.date - b.data.date), pages = Math.ceil(aAuctions.length / 45)
    form.setTitle(`My Auctions Page: ${page}/${pages}`);
    if (!aAuctions.length) return (new CX.messageForm()
    .setTitle('No Auctions Available')
    .setBody('§cHmmm.. seems like theres no auctions that you have made, maybe add an auction using !ah sell <price>')
    .setButton2('§cClose')
    .setButton1('§aOk')
    .show(sender))
    form.addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        const data = CX.item.getItemData(item.item)
        form.addButton(i, item.data.itemName, [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Seller: §eYou\n§7Expires: §6${CX.extra.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§7Price: §a$${CX.extra.parseNumber(Number(item.data.price))}`], data.typeId, data.amount, !data.enchantments.length ? false : true);
    })
    form.show(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 51 && page < pages) myAuctions(page + 1, sender)
        else if (result.selection == 47 && page > 1) myAuctions(page - 1, sender)
        else if (result.selection <= items.length) {
            const selection = items[result.selection]
            const form = new CX.chestForm('small')
            .setTitle(selection.data.itemName + ` Seller: ${selection.data.plrId == sender.id ? '§eYou' : selection.data.creator}`)
            .addButton(5, '§cCancel', ['§6Cancel Purchase'], 'textures/blocks/glass_red');
            if (selection.data.plrId == sender.id) {
                form.addButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(selection.item);
                        auctionItems.deleteID(selection.ID)
                        sender.response.send(`You have succssfully removed the item ${selection.data.itemName}`);
                    }
                });
            }
        }
    });
}
const expiredAuctions = (page, sender) => {
    const form = new CX.chestForm('large');
    const aAuctions = expiredAh.allIDs().filter(i => i.data.plrId == sender.id), pages = Math.ceil(aAuctions.length / 45)
    form.setTitle(`Expired Auctions Page: ${page}/${pages}`);
    if (!aAuctions.length) return (new CX.messageForm()
    .setTitle('No Auctions Available')
    .setBody('§cHmmm.. seems like theres no auctions that you have expired yet, maybe add an auction using !ah sell <price>')
    .setButton2('§cClose')
    .setButton1('§aOk')
    .show(sender))
    form.addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        const data = CX.item.getItemData(item.item)
        form.addButton(i, CX.item.getItemName(item.item, false), [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);
    })
    form.show(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 51 && page < pages) expiredAuctions(page + 1, sender)
        else if (result.selection == 47 && page > 1) expiredAuctions(page - 1, sender)
        else if (result.selection <= items.length) {
            const selection = items[result.selection]
            const form = new CX.chestForm('small')
            .setTitle(CX.item.getItemName(selection.item))
            .addButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red');
            if (selection.data.plrId == sender.id) {
                form.addButton(3, '§cTake Item', ['§6Do You want to take this item?'], 'textures/blocks/barrier')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(selection.item);
                        expiredAh.deleteID(selection.ID)
                        sender.response.send(`You have succssfully taken the item ${CX.item.getItemName(selection.item)}`);
                    }
                });
            }
        }
    });
}
const manageAuctions = (page, sender) => {
    const form = new CX.chestForm('large');
    const aAuctions = auctionItems.allIDs().sort((a, b) => a.data.date - b.data.date), pages = Math.ceil(aAuctions.length / 45)
    form.setTitle(`Manage Auctions Page: ${page}/${pages}`);
    if (!auctionItems.allIDs().length) return (new CX.messageForm()
    .setTitle('No Auctions Available')
    .setBody('§cHmmm.. seems like theres no auctions to see')
    .setButton2('§cClose')
    .setButton1('§aOk')
    .show(sender))
    form.addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        const data = CX.item.getItemData(item.item)
        form.addButton(i, item.data.itemName, [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Seller: §6${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n§7Expires: §6${CX.extra.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§7Price: §a$${CX.extra.parseNumber(Number(item.data.price))}`], data.typeId, data.amount, !data.enchantments.length ? false : true);
    })
    form.show(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 51 && page < pages) manageAuctions(page + 1, sender)
        else if (result.selection == 47 && page > 1) manageAuctions(page - 1, sender)
        else if (result.selection <= items.length) {
            const selection = items[result.selection]
            new CX.chestForm('small')
            .setTitle(selection.data.itemName + ` Seller: ${selection.data.plrId == sender.id ? '§eYou' : selection.data.creator}`)
            .addButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red')
            .addButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
            .show(sender, (res) => {
                if (res.canceled) return;
                if (res.selection == 3) {
                    const inventory = sender.getComponent('inventory').container;
                    if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                    inventory.addItem(selection.item);
                    auctionItems.deleteID(selection.ID)
                    sender.response.send(`You have succssfully removed the item ${selection.data.itemName}`);
                }
            })
        }
    });
}