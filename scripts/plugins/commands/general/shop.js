import { ItemDB } from "../../../API/database/IDB";
import { Databases } from "../../../API/handlers/databases";
import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { ItemTypes } from "@minecraft/server";

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
                .addPattren('circle', '', [], 'textures/blocks/glass_black', [27, 0, 18])
                .addButton(0, '§6Create Category', ['§6Creates a category in the shop §c(admin only)'], 'minecraft:nether_star', 1, true)
                .addButton(14, '§eAdd Item', ['§6Add an item to the shop §c(admin only)'], 'minecraft:stick', 1, true)
                .addButton(12, '§aShop', ['§6All items in the shop'], 'minecraft:golden_carrot', 1, true)
                .addButton(27, '§cClose', ['§6Close this page'], 'minecraft:barrier')
                .addButton(18, '§dManage Categories', ['§6Manage the created categories'], 'minecraft:amethyst_shard')
                form.force(sender, (res) => {
                    if (res.canceled) return
                    if (res.selection == 0) {
                        new CX.modalForm()
                        .setTitle('§6Create Category')
                        .addTextField('The name of the category:', 'Blocks')
                        .addTextField('The description of the category:', 'Blocks stuff')
                        .addTextField('The item of the category:', 'minecraft:stone')
                        .addTextField('The permission tag of the category: (optional)', 'mvp')
                        .show(sender, (result) => {
                            if (result.canceled) return
                            if (Databases.shopCategories.has(result.formValues[0])) return sender.response.error('That category already exists')
                            if (!ItemTypes.get(result.formValues[2])) return sender.response.error('Not a vaild item of the category')
                            Databases.shopCategories.write(result.formValues[0], {
                                description: result.formValues[1],
                                typeId: result.formValues[2],
                                permission: result.formValues[3]
                            })
                            sender.response.send(`Successfully created the category: ${result.formValues[0]}`)
                        })
                    } else if (res.selection == 14) {
                        if (!Databases.shopCategories.keys().length) return (new CX.messageForm()
                        .setTitle('§cNo Shop Categories')
                        .setBody('§4There must be atleast 1 category created to add an item!')
                        .setButton2('§cClose')
                        .setButton1('§aOk')
                        .force(sender, (_) => { }, 220))
                        new CX.modalForm()
                        .setTitle('§eAdd An Item')
                        .addTextField('§6Price §c(Sells the item ur holding only)', "100", "0")
                        .addDropDown('The categorty of the item:', Databases.shopCategories.keys())
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
                                category: Databases.shopCategories.keys()[result.formValues[1]]
                            });
                            sender.response.send(`Successfully sold the item ${CX.item.getItemName(inventory.getItem(sender.selectedSlot), false)} for ${result.formValues[0]}`);
                        });
                    } else if (res.selection == 18) manageCategories(sender, 1) 
                    else if (res.selection == 12) shop(sender, 1)            
                }, 220)
            } else shop(sender, 1)
        })
    }
})
const shop = (sender, page, category = undefined) => {
    if (!category) {
        const keys = Databases.shopCategories.keys(), pages = Math.ceil(keys.length / 45), categories = keys.slice((page - 1) * 45, (page - 1) * 45 + 45)
        if (!keys.length) return (new CX.messageForm()
        .setTitle('§cNo Shop Categories')
        .setBody('§4There are no categories in the shop to show! There must be atleast 1 category to show!')
        .setButton2('§cClose')
        .setButton1('§aOk')
        .force(sender, (_) => { }, 220))
        const form = new CX.chestForm('large')
        .setTitle(`Shop Categories page: ${page}/${pages}`)
        .addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
        if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
        if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
        form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
        categories.forEach((v, i) => {
            const data = Databases.shopCategories.read(v)
            form.addButton(i, v, [data.description.replaceAll('\\n', '\n')], data.typeId, 1, true)
        })
        form.force(sender, (res) => {
            if (res.canceled) return
            if (res.selection == 47 && page > 1) shop(sender, page - 1)
            else if (res.selection == 51 && page < pages) shop(sender, page + 1)
            else if (res.selection <= categories.length) shop(sender, 1, categories[res.selection])
        }, 220)
    } else {
        if (Databases.shopCategories.read(category).permission && !sender.permission.hasPermission('admin') && !sender.hasTag(Databases.shopCategories.read(category).permission)) return sender.response.error('You do not have the permission to view this category')
        const aShopItems = shopItems.allIDs().filter((v) => v.data.category == category), pages = Math.ceil(aShopItems.length / 45), items = aShopItems.slice((page - 1) * 45, (page - 1) * 45 + 45)
        if (!aShopItems.length) return (new CX.messageForm()
        .setTitle('§cNo Shop Items')
        .setBody('§4There are no items in the shop to show!')    
        .setButton2('§cClose')
        .setButton1('§aOk')
        .force(sender, (_) => { }, 220))
        const form = new CX.chestForm('large')
        .setTitle(`${category} page: ${page}/${pages}`)
        .addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
        if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
        if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
        form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
        items.forEach((item, i) => {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, item.data.itemName, [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Price: §a$${CX.extra.parseNumber(Number(item.data.price))}`], data.typeId, data.amount, !data.enchantments.length ? false : true);    
        })
        form.force(sender, (res) => {
            if (res.selection == 47 && page > 1) shop(sender, page - 1, category)
            else if (res.selection == 51 && page < pages) shop(sender, page + 1, category)
            else if (res.selection <= items.length) {
                const selection = items[res.selection]
                if (!sender.permission.hasPermission('admin')) {
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
                } else {
                    new CX.chestForm('small')
                    .setTitle(selection.data.itemName)
                    .addButton(3, '§aBuy', ['§6Do you want to buy this item?'], 'textures/blocks/glass_lime')
                    .addButton(5, '§cRemove', ['§6Remove this item'], 'minecraft:barrier')
                    .show(sender, (res) => {
                        if (res.selection == 5) {
                            sender.response.send(`You have succssfully removed the item ${selection.data.itemName}`);
                            shopItems.deleteID(selection.ID)
                        } else if (res.selection == 3) {
                            if (sender.score.getScore(config.currency) < selection.data.price) return sender.response.error(`You do not have enough ${config.currency}§r§c§l to buy this item`);
                            const inventory = sender.getComponent('inventory').container;
                            if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to buy this item');
                            sender.score.removeScore(config.currency, selection.data.price);
                            inventory.addItem(selection.item);
                            sender.response.send(`You have succssfully bought the item ${selection.data.itemName}`);
                        }
                    })
                }
            }
        }, 220)
    }
}
const manageCategories = (sender, page) => {
    const keys = Databases.shopCategories.keys(), pages = Math.ceil(keys.length / 45), categories = keys.slice((page - 1) * 45, (page - 1) * 45 + 45)
    if (!keys.length) return (new CX.messageForm()
    .setTitle('§cNo Shop Categories')
    .setBody('§4There are no categories in the shop to show! There must be atleast 1 category to show!')
    .setButton2('§cClose')
    .setButton1('§aOk')
    .force(sender, (_) => { }, 220))
    const form = new CX.chestForm('large')
    .setTitle(`Manage Categories page: ${page}/${pages}`)
    .addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
    categories.forEach((v, i) => {
        const data = Databases.shopCategories.read(v)
        form.addButton(i, v, [data.description.replaceAll('\\n', '\n')], data.typeId, 1, true)
    })
    form.force(sender, (res) => {
        if (res.canceled) return
        if (res.selection == 47 && page > 1) manageCategories(sender, page - 1)
        else if (res.selection == 51 && page < pages) manageCategories(sender, page + 1)
        else if (res.selection <= categories.length) {
            const selection = categories[res.selection]
            new CX.chestForm('small')
            .setTitle(`${selection} Category`)
            .addButton(3, '§cRemove Category', ['§6Removes this category'], 'textures/blocks/glass_red', 1)
            .addButton(5, '§cEdit Category', ['§6Edit this category'], 'textures/blocks/glass_lime', 1)
            .show(sender, (result) => {
                if (result.canceled) return
                if (result.selection == 3) {
                    shopItems.allIDs().filter(v => v.data.category == selection).forEach((v) => shopItems.deleteID(v.ID))
                    Databases.shopCategories.delete(selection)
                    sender.response.send(`Successfully deleted the category ${selection}`)
                } else if (result.selection == 5) {
                    new CX.modalForm()
                    .addTextField('The description of the category:', Databases.shopCategories.read(selection).description, Databases.shopCategories.read(selection).description)
                    .addTextField('The item of the category:', Databases.shopCategories.read(selection).typeId, Databases.shopCategories.read(selection).typeId)
                    .addTextField('The permission tag of the category: (optional)', Databases.shopCategories.read(selection).permission ?? 'mvp')
                    .show(sender, (result) => {
                        if (result.canceled) return
                        Databases.shopCategories.delete(selection)
                        Databases.shopCategories.write(selection, {
                            description: result.formValues[0],
                            typeId: result.formValues[1],
                            permission: result.formValues[2] ?? undefined
                        })
                        sender.response.send(`Successfully edited the category: ${selection}`)
                    })
                }
            })
        }
    }, 220)
}