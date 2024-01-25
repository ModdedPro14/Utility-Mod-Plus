import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { ItemDB } from "../../../API/database/IDB";
import { Databases } from "../../../API/handlers/databases";

const auctionItems = new ItemDB('auctions'), expiredAh = new ItemDB('expiredAuctions')

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('auctionhouse')
    .setDescription('An auction house')
    .setCategory('general')
    .setAliases(['ah'])
    .firstArguments(['sell', 'search'], false)
    .addDynamicArgument('sell', [], 'sell', 'price')
    .addDynamicArgument('search', [], 'search', ['name'])
    .addNumberArgument('price', [{ name: 'sell', type: 'dyn' }])
    .addAnyArgument('name', [{ name: 'search', type: 'dyn' }], 1),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (args.length) return;
            sender.response.send('Close the chat within 10 secondes');
            allAuctions(1, sender)
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
                itemName: CX.item.getItemName(inventory.getItem(sender.selectedSlot)),
                plrId: sender.id,
                date: Date.now(),
                expires: (new Date().getTime() + (48 * 3.6e+6)).toString(16)
            })
            inventory.setItem(sender.selectedSlot);
        });
        ctx.executeArgument('search', (sender, _, args) => {
            if (!auctionItems.allIDs().find((v) => v.data.creator == args[0])) return sender.response.error(`There were no auctions by the seller: ${args[0]}`)
            sender.response.send('Close the chat in 10 seconds')
            search(1, sender, auctionItems.allIDs().find((v) => v.data.creator == args[0]).data.plrId, args[0])
        })
    }
})

const allAuctions = (page, sender) => {
    const aAuctions = auctionItems.allIDs().sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    const form = new CX.chestForm('large')
    .setTitle(`Auctions §f${page}§r/§f${pages}`)
    .addButton(49, 'Informations', ['§7-------------------------------------', "§l» §r§7Welcome to the auction house", "§l» §r§7it's a market where all the players", "§l» §r§7can sell or buy items.", "", "§l» §r§7To be able to sell items you must do", `§l» §r§a${config.prefix}ah sell §7<§aprice§7>`, "", `§l» §r§7Number of items available§7: §b${aAuctions.length}`, "§7-------------------------------------"], 'minecraft:nether_star')
    .addButton(50, 'Next page', [], 'minecraft:arrow')
    .addButton(48, 'Previous page', [], 'minecraft:arrow')
    .addButton(45, 'Expired Auctions', [`§r» §7You have §b${expiredAh.allIDs().filter(s => s.data.plrId == sender.id).length} §7expired items`], 'minecraft:chest')
    .addButton(46, 'My Auctions', [`§r» §7You have §b${aAuctions.filter(i => i.data.plrId == sender.id).length} §7items`], 'minecraft:ender_chest')
    .addButton(53, 'Search', ['§r» §7Search through a players auctions'], 'minecraft:spyglass')
    if (sender.permission.hasPermission('admin')) form.addButton(52, 'Manage Auctions', ['§r» §7Manage the listed autctions'], 'minecraft:amethyst_shard')
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
        } else {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to buy this item\n\n  §r* Seller: §a${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n  §r* Price: §a${CX.extra.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${CX.extra.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);
        }
    })
    form.force(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 45) expiredAuctions(1, sender)
        else if (result.selection == 46) myAuctions(1, sender)
        else if (result.selection == 50) allAuctions(page < pages ? page + 1 : page, sender)
        else if (result.selection == 48) allAuctions(page > 1 ? page - 1 : page, sender)
        else if (result.selection == 52 && sender.permission.hasPermission('admin')) manageAuctions(1, sender)
        else if (result.selection == 53) {
            new CX.modalForm()
            .setTitle('Search')
            .addTextField('Enter a players name:', 'Somebody123')
            .show(sender, (res) => {
                if (res.canceled) return allAuctions(page, sender)
                if (!res.formValues[0]) return sender.response.error('You must specify a players name')
                if (!auctionItems.allIDs().find((v) => v.data.creator == res.formValues[0])) return sender.response.error(`There were no auctions by the seller: ${res.formValues[0]}`)
                search(1, sender, auctionItems.allIDs().find((v) => v.data.creator == res.formValues[0]).data.plrId, res.formValues[0])
            })
        } else if (result.selection <= items.length) {
            const selection = items[result.selection]
            const form = new CX.chestForm('small')
            .setTitle(selection.data.itemName + ` Seller: ${selection.data.plrId == sender.id ? '§eYou' : selection.data.creator}`)
            .addButton(5, '§cCancel', ['§6Cancel Purchase'], 'textures/blocks/glass_red');
            if (selection.data.plrId == sender.id) {
                form.addButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        if (!auctionItems.has(selection.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(selection.item);
                        auctionItems.deleteID(selection.ID)
                        sender.response.send(`You have succssfully removed the item ${selection.data.itemName}`);
                    }
                });
            } else {
                form.addButton(3, '§aPurchase', ['§6Do You want to buy this item?'], 'textures/blocks/glass_lime')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        if (!auctionItems.has(selection.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                        if (sender.score.getScore(config.currency) < selection.data.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§lto buy this item`);
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                        sender.score.removeScore(config.currency, selection.data.price);
                        inventory.addItem(selection.item);
                        sender.response.send(`You have succssfully bought the item ${selection.data.itemName}`);
                        Databases.auctionClaims.write(selection.data.plrId, selection.data.price);
                        auctionItems.deleteID(selection.ID)
                    }
                });
            }
        }
    }, 220);
}
const myAuctions = (page, sender) => { 
    const aAuctions = auctionItems.allIDs().filter(i => i.data.plrId == sender.id).sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    const form = new CX.chestForm('large')
    .setTitle(`My Auctions §f${page}§r/§f${pages}`)
    .addButton(49, '§cBack', [], 'minecraft:nether_star')
    .addButton(50, 'Next page', [], 'minecraft:arrow')
    .addButton(48, 'Previous page', [], 'minecraft:arrow')
    .addPattren('bottom', '', [], 'textures/blocks/glass_black', [48, 49, 50])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
        } else {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to manage this item\n\n  §r* Seller: §eYou\n  §r* Price: §a${CX.extra.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${CX.extra.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);
        }
    })
    form.show(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 49) allAuctions(1, sender)
        else if (result.selection == 50) myAuctions(page < pages ? page + 1 : page, sender)
        else if (result.selection == 48) myAuctions(page > 1 ? page - 1 : page, sender)
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
                        if (!auctionItems.has(selection.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
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
    const aAuctions = expiredAh.allIDs().filter(i => i.data.plrId == sender.id), pages = Math.ceil(aAuctions.length / 45)
    const form = new CX.chestForm('large')
    .setTitle(`Expired Auctions §f${page}§r/§f${pages}`)
    .addButton(49, '§cBack', [], 'minecraft:nether_star')
    .addButton(50, 'Next page', [], 'minecraft:arrow')
    .addButton(48, 'Previous page', [], 'minecraft:arrow')
    .addPattren('bottom', '', [], 'textures/blocks/glass_black', [48, 49, 50])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        const data = CX.item.getItemData(item.item)
        form.addButton(i, CX.item.getItemName(item.item), [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);
    })
    form.show(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 49) allAuctions(1, sender)
        else if (result.selection == 50) expiredAuctions(page < pages ? page + 1 : page, sender)
        else if (result.selection == 48) expiredAuctions(page > 1 ? page - 1 : page, sender)
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
    const aAuctions = auctionItems.allIDs().sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    const form = new CX.chestForm('large')
    .setTitle(`Manage Auctions §f${page}§r/§f${pages}`)
    .addButton(49, '§cBack', [], 'minecraft:nether_star')
    .addButton(50, 'Next page', [], 'minecraft:arrow')
    .addButton(48, '§cPrevious page', [], 'minecraft:arrow')
    .addPattren('bottom', '', [], 'textures/blocks/glass_black', [48, 49, 50])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
        } else {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to manage this item\n\n  §r* Seller: §a${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n  §r* Price: §a${CX.extra.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${CX.extra.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);
        }
    })
    form.show(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 49) allAuctions(1, sender)
        else if (result.selection == 50) manageAuctions(page < pages ? page + 1 : page, sender)
        else if (result.selection == 48) manageAuctions(page > 1 ? page - 1 : page, sender)
        else if (result.selection <= items.length) {
            const selection = items[result.selection]
            new CX.chestForm('small')
            .setTitle(selection.data.itemName + ` Seller: ${selection.data.plrId == sender.id ? '§eYou' : selection.data.creator}`)
            .addButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red')
            .addButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
            .show(sender, (res) => {
                if (res.canceled) return;
                if (res.selection == 3) {
                    if (!auctionItems.has(selection.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
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
const search = (page, sender, id, name) => {
    const aAuctions = auctionItems.allIDs().filter((v) => v.data.plrId == id).sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    const form = new CX.chestForm('large')
    .setTitle(`${name} Auctions §f${page}§r/§f${pages}`)
    .addButton(49, '§cBack', [], 'minecraft:nether_star')
    .addButton(50, 'Next page', [], 'minecraft:arrow')
    .addButton(48, 'Previous page', [], 'minecraft:arrow')
    .addPattren('bottom', '', [], 'textures/blocks/glass_black', [48, 49, 50])
    const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
    items.forEach((item, i) => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
        } else {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to buy this item\n\n  §r* Seller: §a${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n  §r* Price: §a${CX.extra.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${CX.extra.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);
        }
    })
    form.force(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 49) allAuctions(1, sender)
        else if (result.selection == 50) search(page < pages ? page + 1 : page, sender, id, name)
        else if (result.selection == 48) search(page > 1 ? page - 1 : page, sender, id, name)
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
                        if (!auctionItems.has(selection.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(selection.item);
                        auctionItems.deleteID(selection.ID)
                        sender.response.send(`You have succssfully removed the item ${selection.data.itemName}`);
                    }
                });
            } else {
                form.addButton(3, '§aPurchase', ['§6Do You want to buy this item?'], 'textures/blocks/glass_lime')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        if (!auctionItems.has(selection.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                        if (sender.score.getScore(config.currency) < selection.data.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§lto buy this item`);
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                        sender.score.removeScore(config.currency, selection.data.price);
                        inventory.addItem(selection.item);
                        sender.response.send(`You have succssfully bought the item ${selection.data.itemName}`);
                        Databases.auctionClaims.write(selection.data.plrId, selection.data.price);
                        auctionItems.deleteID(selection.ID)
                    }
                });
            }
        }
    }, 220);
}