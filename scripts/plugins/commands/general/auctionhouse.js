import config from "../../../config/main";
import { ItemDB } from "../../../API/database/IDB";
import { Databases } from "../../../API/handlers/databases";
import { Vera } from "../../../API/Vera";

const auctionItems = new ItemDB('auctions'), expiredAh = new ItemDB('expiredAuctions')

Vera.JAR.getPackage(Vera.Engine.new.commandPackage).unpack((cmd) => cmd
    .setName('auctionhouse')
    .setDescription('An auction house')
    .setCategory('general')
    .setAliases(['ah'])
    .addDynamicArgument((arg) => arg
        .setName('sell')
        .setOptional(true)
        .setValues(['sell'])
    )
    .addSubArguments('sell', (args) => args
        .addNumberArgument((arg) => arg
            .setName('price')
            .setCallback((sender, value) => {
                if (auctionItems.allIDs().filter((k) => k.data.plrId == sender.id).length >= config.maxAuctions) return sender.response.error('You have made the maximum amount of auctions');
                const inventory = sender.getComponent('inventory').container;
                if (!inventory.getItem(sender.selectedSlot)) return sender.response.error('You must hold the item to auction');
                if (config.allCbes.includes(inventory.getItem(sender.selectedSlot).typeId.replace('mincraft:'))) return sender.response.error('You cannot auction that item');
                if (value < 100) return sender.response.error('The price cant be less than 100')
                if (value > 100000000) return sender.response.error('The price cant be bigger than 100000000');
                sender.response.send(`Successfully sold the item §c${Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemName(inventory.getItem(sender.selectedSlot))} for ${value}`);
                auctionItems.writeItem(inventory.getItem(sender.selectedSlot), {
                    creator: sender.name,
                    price: value,
                    itemName: Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemName(inventory.getItem(sender.selectedSlot)),
                    plrId: sender.id,
                    date: Date.now(),
                    expires: (new Date().getTime() + (48 * 3.6e+6)).toString(16)
                })
                inventory.setItem(sender.selectedSlot);
            })
        )
    )
    .addDynamicArgument((arg) => arg
        .setName('search')
        .setOptional(true)
        .setValues(['search'])
    )
    .addSubArguments('search', (args) => args
        .addAnyArgument((arg) => arg
            .setName('name')
            .setCallback((sender, value) => {
                if (!auctionItems.allIDs().find((v) => v.data.creator == value)) return sender.response.error(`There were no auctions by the seller: ${value}`)
                sender.response.send('Close the chat in 10 seconds')
                search(1, sender, auctionItems.allIDs().find((v) => v.data.creator == value).data.plrId, value)
            })
        )
    )
    .execute((sender, args) => {
        if (args.length) return;
        sender.response.send('Close the chat within 10 secondes');
        allAuctions(1, sender)
    })
)

const allAuctions = (page, sender) => {
    const aAuctions = auctionItems.allIDs().filter(item => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
            return false
        } else return true
    }).sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
        form.setSize('large')
        .setTitle(`Auctions §f${page}§r/§f${pages}`)
        .addPattren('circle', '', [], 'textures/blocks/glass_black', [45, 46, 47, 48, 49, 50, 51, 52, 53])
        .setButton(49, 'Informations', ['§7-------------------------------------', "§l» §r§7Welcome to the auction house", "§l» §r§7it's a market where all the players", "§l» §r§7can sell or buy items.", "", "§l» §r§7To be able to sell items you must do", `§l» §r§a${config.prefix}ah sell §7<§aprice§7>`, "", `§l» §r§7Number of items available§7: §b${aAuctions.length}`, "§7-------------------------------------"], 'minecraft:nether_star')
        .setButton(50, 'Next page', [], 'minecraft:arrow')
        .executeButton(50, () => allAuctions(page < pages ? page + 1 : page, sender))
        .setButton(48, 'Previous page', [], 'minecraft:arrow')
        .executeButton(48, () => allAuctions(page > 1 ? page - 1 : page, sender))
        .setButton(45, 'Expired Auctions', [`§r» §7You have §b${expiredAh.allIDs().filter(s => s.data.plrId == sender.id).length} §7expired items`], 'minecraft:chest')
        .executeButton(45, () => expiredAuctions(1, sender))
        .setButton(46, 'My Auctions', [`§r» §7You have §b${aAuctions.filter(i => i.data.plrId == sender.id).length} §7items`], 'minecraft:ender_chest')
        .executeButton(46, () => myAuctions(1, sender))
        .setButton(53, 'Search', ['§r» §7Search through a players auctions'], 'minecraft:spyglass')
        .executeButton(53, () => {
            Vera.JAR.getPackage(Vera.Engine.new.modalFormPackage).unpack((form) => {
                form.setTitle('Search')
                .addTextField('Enter a players name:', 'Somebody123')
                .show(sender, (res) => {
                    if (res.canceled) return allAuctions(page, sender)
                    if (!res.formValues[0]) return sender.response.error('You must specify a players name')
                    if (!auctionItems.allIDs().find((v) => v.data.creator == res.formValues[0])) return sender.response.error(`There were no auctions by the seller: ${res.formValues[0]}`)
                    search(1, sender, auctionItems.allIDs().find((v) => v.data.creator == res.formValues[0]).data.plrId, res.formValues[0])
                })
            })
        })
        if (sender.permission.hasPermission('admin')) form.setButton(52, 'Manage Auctions', ['§r» §7Manage the listed autctions'], 'minecraft:amethyst_shard').executeButton(52, () => sender.permission.hasPermission('admin') ? manageAuctions(1, sender) : undefined)
        const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
        items.forEach((item) => {
            const data = Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemData(item.item)
            form.executeButton(form.addButton(item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${Vera.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to buy this item\n\n  §r* Seller: §a${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n  §r* Price: §a${Vera.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${Vera.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true), () => {
                Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
                    form.setSize('small')
                    .setTitle(item.data.itemName + ` Seller: ${item.data.plrId == sender.id ? '§eYou' : item.data.creator}`)
                    .setButton(5, '§cCancel', ['§6Cancel Purchase'], 'textures/blocks/glass_red');
                    if (item.data.plrId == sender.id) {
                        form.setButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
                        .executeButton(3, () => {
                            if (!auctionItems.has(item.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                            const inventory = sender.getComponent('inventory').container;
                            if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                            inventory.addItem(item.item);
                            auctionItems.deleteID(item.ID)
                            sender.response.send(`You have succssfully removed the item ${item.data.itemName}`);
                        }).show(sender);
                    } else {
                        form.setButton(3, '§aPurchase', ['§6Do You want to buy this item?'], 'textures/blocks/glass_lime')
                        .executeButton(3, () => {
                            if (!auctionItems.has(item.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                            if (sender.score.getScore(config.currency) < item.data.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§lto buy this item`);
                            const inventory = sender.getComponent('inventory').container;
                            if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                            sender.score.removeScore(config.currency, item.data.price);
                            inventory.addItem(item.item);
                            sender.response.send(`You have succssfully bought the item ${item.data.itemName}`);
                            Databases.auctionClaims.write(item.data.plrId, item.data.price);
                            auctionItems.deleteID(item.ID)
                        }).show(sender);
                    }
                })
            })
        })
        form.force(sender, () => {}, 220);
    })
}
const myAuctions = (page, sender) => { 
    const aAuctions = auctionItems.allIDs().filter(i => i.data.plrId == sender.id).filter(item => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
            return false
        } else return true
    }).sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
        form.setSize('large')
        .setTitle(`My Auctions §f${page}§r/§f${pages}`)
        .addPattren('circle', '', [], 'textures/blocks/glass_black', [46, 47, 48, 49, 50, 51, 52])
        .setButton(49, '§cBack', [], 'minecraft:nether_star')
        .executeButton(49, () => allAuctions(1, sender))
        .setButton(50, 'Next page', [], 'minecraft:arrow')
        .executeButton(50, () => myAuctions(page < pages ? page + 1 : page, sender))
        .setButton(48, 'Previous page', [], 'minecraft:arrow')
        .executeButton(48, () => myAuctions(page > 1 ? page - 1 : page, sender))
        const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
        items.forEach((item) => {
            const data = Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemData(item.item)
            form.executeButton(form.addButton(item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${Vera.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to manage this item\n\n  §r* Seller: §eYou\n  §r* Price: §a${Vera.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${Vera.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true), () => {
                Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
                    form.setSize('small')
                    .setTitle(item.data.itemName + ` Seller: ${item.data.plrId == sender.id ? '§eYou' : item.data.creator}`)
                    .setButton(5, '§cCancel', ['§6Cancel Purchase'], 'textures/blocks/glass_red')
                    .setButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
                    .executeButton(3, () => {
                        if (!auctionItems.has(item.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(item.item);
                        auctionItems.deleteID(item.ID)
                        sender.response.send(`You have succssfully removed the item ${item.data.itemName}`);
                    }).show(sender);
                }) 
            })
        })
        form.show(sender);
    })
}
const expiredAuctions = (page, sender) => {
    const aAuctions = expiredAh.allIDs().filter(i => i.data.plrId == sender.id), pages = Math.ceil(aAuctions.length / 45)
    Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
        form.setSize('large')
        .setTitle(`Expired Auctions §f${page}§r/§f${pages}`)
        .addPattren('circle', '', [], 'textures/blocks/glass_black', [46, 47, 48, 49, 50, 51, 52])
        .setButton(49, '§cBack', [], 'minecraft:nether_star')
        .executeButton(49, () => allAuctions(1, sender))
        .setButton(50, 'Next page', [], 'minecraft:arrow')
        .executeButton(50, () => expiredAuctions(page < pages ? page + 1 : page, sender))
        .setButton(48, 'Previous page', [], 'minecraft:arrow')
        .executeButton(48, () => expiredAuctions(page > 1 ? page - 1 : page, sender))
        const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
        items.forEach((item) => {
            const data = Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemData(item.item)
            form.executeButton(form.setButton(Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemName(item.item), [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${Vera.convertToRoman(e.level)}`).join('\n') : '', data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true), () => {
                Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
                    form.setSize('small')
                    .setTitle(Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemName(item.item))
                    .setButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red')
                    .setButton(3, '§cTake Item', ['§6Do You want to take this item?'], 'textures/blocks/barrier')
                    .executeButton(3, () => {
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(item.item);
                        expiredAh.deleteID(item.ID)
                        sender.response.send(`You have succssfully taken the item ${Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemName(selection.item)}`);
                    }).show(sender);
                })
            })
        })
        form.show(sender);
    })
}
const manageAuctions = (page, sender) => {
    const aAuctions = auctionItems.allIDs().filter(item => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
            return false
        } else return true
    }).sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
        form.setSize('large')
        .setTitle(`Manage Auctions §f${page}§r/§f${pages}`)
        .addPattren('circle', '', [], 'textures/blocks/glass_black', [46, 47, 48, 49, 50, 51, 52])
        .setButton(49, '§cBack', [], 'minecraft:nether_star')
        .executeButton(49, allAuctions(1, sender))
        .setButton(50, 'Next page', [], 'minecraft:arrow')
        .executeButton(50, () => manageAuctions(page < pages ? page + 1 : page, sender))
        .setButton(48, '§cPrevious page', [], 'minecraft:arrow')
        .executeButton(48, () => manageAuctions(page > 1 ? page - 1 : page, sender))
        const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
        items.forEach((item) => {
            const data = Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemData(item.item)
            form.executeButton(form.addButton(item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${Vera.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to manage this item\n\n  §r* Seller: §a${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n  §r* Price: §a${Vera.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${Vera.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true), () => {
                Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
                    form.setSize('small')
                    .setTitle(item.data.itemName + ` Seller: ${item.data.plrId == sender.id ? '§eYou' : item.data.creator}`)
                    .setButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red')
                    .setButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
                    .executeButton(3, () => {
                        if (!auctionItems.has(item.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(item.item);
                        auctionItems.deleteID(item.ID)
                        sender.response.send(`You have succssfully removed the item ${item.data.itemName}`);
                    }).show(sender)
                })
            })
        })
        form.show(sender);
    })
}
const search = (page, sender, id, name) => {
    const aAuctions = auctionItems.allIDs().filter((v) => v.data.plrId == id).filter(item => {
        if ((parseInt(item.data.expires, 16)) < Date.now()) {
            try {
                expiredAh.writeItem(item.item, {
                    plrId: item.data.plrId
                })
                auctionItems.deleteID(item.ID)
            } catch {}
            return false
        } else return true
    }).sort((a, b) => b.data.date - a.data.date), pages = Math.ceil(aAuctions.length / 45)
    Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
        form.setSize('large')
        .setTitle(`${name} Auctions §f${page}§r/§f${pages}`)
        .addPattren('circle', '', [], 'textures/blocks/glass_black', [46, 47, 48, 49, 50, 51, 52])
        .setButton(49, '§cBack', [], 'minecraft:nether_star')
        .executeButton(49, () => allAuctions(1, sender))
        .setButton(50, 'Next page', [], 'minecraft:arrow')
        .executeButton(50, () => search(page < pages ? page + 1 : page, sender, id, name))
        .setButton(48, 'Previous page', [], 'minecraft:arrow')
        .executeButton(48, () => search(page > 1 ? page - 1 : page, sender, id, name))
        const items = aAuctions.slice((page - 1) * 45, (page - 1) * 45 + 45)
        items.forEach((item) => {
            const data = Vera.JAR.getRawPackage(Vera.Engine.raw.itemPackage).getItemData(item.item)
            form.executeButton(form.addButton(item.data.itemName, [data.enchantments.length ? '\n' + data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${Vera.convertToRoman(e.level)}`).join('\n') : '', `§8§l---------------------------\n§r§8[§a!§8]§r Click to buy this item\n\n  §r* Seller: §a${item.data.plrId == sender.id ? '§eYou' : item.data.creator}\n  §r* Price: §a${Vera.parseNumber(Number(item.data.price))}$\n  §r* Expire: §a${Vera.parseTime(parseInt(item.data.expires, 16) - new Date().getTime())}\n§r§8§l---------------------------`, data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true), () => {
                Vera.JAR.getPackage(Vera.Engine.new.chestFormPackage).unpack((form) => {
                    form.setSize('small')
                    .setTitle(item.data.itemName + ` Seller: ${item.data.plrId == sender.id ? '§eYou' : item.data.creator}`)
                    .setButton(5, '§cCancel', ['§6Cancel Purchase'], 'textures/blocks/glass_red');
                    if (item.data.plrId == sender.id) {
                        form.setButton(3, '§cRemove Auction', ['§6Do You want to remove this item?'], 'textures/blocks/barrier')
                        .executeButton(3, () => {
                            if (!auctionItems.has(item.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                            const inventory = sender.getComponent('inventory').container;
                            if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                            inventory.addItem(item.item);
                            auctionItems.deleteID(item.ID)
                            sender.response.send(`You have succssfully removed the item ${item.data.itemName}`);
                        }).show(sender);
                    } else {
                        form.setButton(3, '§aPurchase', ['§6Do You want to buy this item?'], 'textures/blocks/glass_lime')
                        .executeButton(3, () => {
                            if (!auctionItems.has(item.ID)) return sender.response.error('That item dosent exist in the auction house anymore')
                            if (sender.score.getScore(config.currency) < item.data.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§lto buy this item`);
                            const inventory = sender.getComponent('inventory').container;
                            if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                            sender.score.removeScore(config.currency, item.data.price);
                            inventory.addItem(item.item);
                            sender.response.send(`You have succssfully bought the item ${item.data.itemName}`);
                            Databases.auctionClaims.write(item.data.plrId, item.data.price);
                            auctionItems.deleteID(item.ID)
                        }).show(sender);
                    }
                })
            })
        })
        form.force(sender, () => {}, 220);
    })
}