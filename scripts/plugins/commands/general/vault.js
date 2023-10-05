import { CX } from "../../../API/CX";
import { ItemDB } from "../../../API/database/IDB";
import { Databases } from "../../../API/handlers/databases";
import config from "../../../config/main";

const vaultItems = new ItemDB('vaultItems')

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('vault')
    .setDescription('Vault system')
    .setCategory('general')
    .firstArguments(['buy', 'add'], false)
    .addDynamicArgument('buy', [], 'buy')
    .addDynamicArgument('add', [], 'add'),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (args.length) return
            sender.response.send('Close the chat within 10 secondes')
            if (sender.permission.hasPermission('admin')) {
                new CX.chestForm('medium')
                .setTitle('Vault')
                .addPattren('circle', '', [], 'textures/blocks/glass_black')
                .addButton(12, '§aMy vault', ['§6Show your vault'], 'minecraft:diamond', 1, true)
                .addButton(14, '§cManage vaults', ['§6Manage created vaults'], 'minecraft:emerald', 1, true)
                .force(sender, (res) => {
                    if (res.canceled) return
                    if (res.selection == 12) vault(sender, 1)
                    else if (res.selection == 14) manageVaults(sender, 1)
                }, 220)
            } else vault(sender, 1)
        })
        ctx.executeArgument('add', (sender) => {
            const inv = sender.getComponent('inventory').container
            if (!Databases.vaults.has(sender.id)) return sender.response.error('You have not purchased a vault yet')
            if (vaultItems.allIDs().filter((v) => v.data.id == sender.id).length >= (Databases.vaults.read(sender.id).pages * 45)) return sender.response.error(`You have added the max amount of items your vault can hold. You can upgrade your vault by doing "${config.prefix}vault buy"`)
            if (!inv.getItem(sender.selectedSlot)) return sender.response.error('You must hold the item you want to add')
            vaultItems.writeItem(inv.getItem(sender.selectedSlot), {
                id: sender.id,
            })
            inv.setItem(sender.selectedSlot)
            sender.response.send('Successfully added the item to the vault')
        })
        ctx.executeArgument('buy', (sender) => {
            if (sender.score.getScore(config.currency) < config.vaultCost) return sender.response.error(`You do not have enough ${config.currency} to buy a vault`)
            if (Databases.vaults.has(sender.id) && Databases.vaults.read(sender.id).pages >= config.vaultMaxPages) return sender.response.error('You have bought the max amount of pages')
            Databases.vaults.write(sender.id, {
                pages: Databases.vaults.has(sender.id) ? Databases.vaults.read(sender.id).pages + 1 : 1,
                name: sender.name,
                id: sender.id
            })
            sender.response.send('Successfully bought a new vault')
            sender.score.removeScore(config.currency, config.vaultCost)
        })
    }
})

const vault = (sender, page, id) => {
    const filtered = vaultItems.allIDs().filter((v) => !id ? sender.id == v.data.id : id == v.data.id), pages = Math.ceil(filtered.length / 45), items = filtered.slice((page - 1) * 45, (page - 1) * 45 + 45)
    if (!filtered.length) return (new CX.messageForm()
    .setTitle('§cNo Vault Items')
    .setBody(`§4You have not added any items in the vault yet... You can add an item by using "${config.prefix}vault add"`)
    .setButton2('§cClose')
    .setButton1('§aOk')
    .force(sender, (_) => { }, 220))
    const form = new CX.chestForm('large')
    .setTitle(!id ? `My vault page: ${page}/${pages}` : `${Databases.vaults.read(id).name}'s §rvault page: ${page}/${pages}`)
    .addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
    items.forEach((v, i) => {
        const data = CX.item.getItemData(v.item)
        form.addButton(i, CX.item.getItemName(v.item), [data.enchantments.length ? data.enchantments.map(e => `§7${e.id} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore], data.typeId, data.amount, !data.enchantments.length ? false : true);    
    })
    form.force(sender, (res) => {
        if (res.canceled) return
        if (res.selection == 47 && page > 1) vault(sender, page - 1, !id ? undefined : id)
        else if (res.selection == 51 && page < pages) vault(sender, page + 1, !id ? undefined : id)
        else if (res.selection <= items.length) {
            const selection = items[res.selection]
            new CX.chestForm('small')
            .setTitle(CX.item.getItemName(selection.item))
            .addButton(3, '§aTake item', ['§cTake this item from the vault'], 'textures/blocks/glass_lime')
            .addButton(5, '§cClose', ['§6Close this page'], 'textures/blocks/glass_red')
            .show(sender, (result) => {
                if (result.canceled) return
                if (result.selection == 3) {
                    if (id && !vaultItems.has(selection.ID)) return sender.response.error('That item dosent exist in the vault anymore') 
                    const inventory = sender.getComponent('inventory').container;
                    if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to take this item out of the vault');
                    inventory.addItem(selection.item)
                    vaultItems.deleteID(selection.ID)
                    sender.response.send('Successfully taken item out of the vault')
                }
            })
        }
    }, 220)
}

const manageVaults = (sender, page) => {
    const values = Databases.vaults.values(), pages = Math.ceil(values.length / 45), vaults = values.slice((page - 1) * 45, (page - 1) * 45 + 45)
    if (!vaults.length) return (new CX.messageForm()
    .setTitle('§cNo Vaults')
    .setBody(`§4There are no vaults that have been created...`)
    .setButton2('§cClose')
    .setButton1('§aOk')
    .force(sender, (_) => { }, 220))
    const form = new CX.chestForm('large')
    .setTitle(`Manage vaults page: ${page}/${pages}`)
    .addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
    values.forEach((v, i) => {
        form.addButton(i, `${v.name}'s §rVault`, ['§6Click to manage this players vault'], 'minecraft:iron_ingot', 1, true)
    })
    form.show(sender, (res) => {
        if (res.canceled) return
        if (res.selection == 47 && page > 1) manageVaults(sender, page - 1)
        else if (res.selection == 51 && page < pages) manageVaults(sender, page + 1)
        else if (res.selection <= vaults.length) {
            const selection = vaults[res.selection]
            vault(sender, 1, selection.id)
        }
    })
}