import { CX } from "../../../API/CX";
import { ItemDB } from "../../../API/database/IDB";
import { Databases } from "../../../API/handlers/databases";
import config from "../../../config/main";

const mailItems = new ItemDB('mailItems')

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('mail')
    .setDescription('Send and recive mail in items and notes')
    .setCategory('general')
    .firstArguments(['send'], false)
    .addDynamicArgument('send', [], 'send', ['item', 'note'])
    .addDynamicArgument('item', [], 'item', 'player')
    .addDynamicArgument('note', [], ['note', 'text'], 'plr')
    .addAnyArgument('player', [{ name: 'send', type: 'dyn' }, { name: 'item', type: 'dyn' }], 1)
    .addAnyArgument('plr', [], 1, null, 'text')
    .addAnyArgument('text', [{ name: 'send', type: 'dyn' }, { name: 'note', type: 'dyn' }, { name: 'plr', type: 'player' }], 1),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (args.length) return
            sender.response.send('Close the chat within 10 seconds')
            mails(sender, 1)
        })
        ctx.executeArgument('send', (sender, _, args) => {
            if (!Databases.players.values().find((v) => v.name == args[1])) return sender.response.error('That player doesnt exist') 
            // if (args[1] == sender.name) return sender.response.error('You cant send a mail to yourself')
            if (args[0] == 'item') {
                const inventory = sender.getComponent('inventory').container
                if (!inventory.getItem(sender.selectedSlot)) return sender.response.error('You must hold the item you want to send')
                mailItems.writeItem(inventory.getItem(sender.selectedSlot), {
                    to: { id: Databases.players.values().find((v) => v.name == args[1]).id, name: args[1] },
                    from: { id: sender.id, name: sender.name },
                    itemName: CX.item.getItemName(inventory.getItem(sender.selectedSlot)),
                    type: 'item'
                })
                inventory.setItem(sender.selectedSlot)
                sender.response.send(`Successfully sent the held item as a mail to ${args[1]}`)
            } else {
                const key = CX.generateID()
                Databases.mails.write(key, {
                    to: { id: Databases.players.values().find((v) => v.name == args[1]).id, name: args[1] },
                    from: { id: sender.id, name: sender.name },
                    note: args[2],
                    type: 'note',
                    key: key
                })
                sender.response.send(`Successfully sent a note mail to ${args[1]}`)
            }
        })
    }
})

const mails = (sender, page) => {
    const allMails = [...mailItems.allIDs().filter((v) => v.data.to.id == sender.id), ...Databases.mails.values().filter((v) => v.to.id == sender.id)], pages = Math.ceil(allMails.length / 45)
    const form = new CX.chestForm('large')
    .setTitle(`Your Mails §f${page}§r/§f${pages}`)
    .addButton(49, 'Informations', ['§7-------------------------------------', "§l» §r§7Welcome to the mail system", "§l» §r§7it's a mail system where players", "§l» §r§7can send you mail or you send mail to them.", "", "§l» §r§7To be able to send a mail you must do", `§l» §r§a${config.prefix}mail send item §7<§aplayer§7>`,`§l» §r§a${config.prefix}mail send note §7<§aplayer§7> §7<§atext§7>`,"", "§l» §r§7There are §b2§7 types of mails", "§l» §r§aNote mail, §7Send text mails to players", "§l» §r§aItem mail, §7Send an item as a mail to a player", "", `§l» §r§7Number of mails received§7: §b${allMails.length}`, "§7-------------------------------------"], 'minecraft:nether_star')
    .addButton(50, 'Next page', [], 'minecraft:arrow')
    .addButton(48, 'Previous page', [], 'minecraft:arrow')
    .addPattren('bottom', '', [], 'textures/blocks/glass_black', [48, 49, 50])
    const mail = allMails.slice((page - 1) * 45, (page - 1) * 45 + 45)
    mail.forEach((m, i) => {
        if (m?.type == 'note') {
            form.addButton(i, `Note from: ${m.from.name}`, [`\n${m.note}`], 'minecraft:paper');
        } else if (m.data?.type == 'item') {
            const data = CX.item.getItemData(m.item)
            form.addButton(i, m.data.itemName, [data.enchantments.length ? data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Sent by: ${m.data.from.name}`], data.typeId, data.amount, !data.enchantments.length ? false : true);
        }
    })
    form.force(sender, (result) => {
        if (result.canceled) return
        if (result.selection == 50) mails(sender, page < pages ? page + 1 : page)
        else if (result.selection == 48) mails(sender, page > 1 ? page - 1 : page)
        else if (result.selection <= mail.length) {
            const selection = mail[result.selection]
            if (selection?.type == 'note') {
                new CX.chestForm('small')
                .setTitle(`Note from: ${selection.from.name}`)
                .addButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red')
                .addButton(3, '§cRemove Mail', ['§6Do You want to remove this mail?'], 'textures/blocks/glass_lime')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        Databases.mails.delete(selection.key)
                        sender.response.send(`You have succssfully removed the mail from ${selection.from.name}`);
                    }
                });
            } else if (selection.data?.type == 'item') {
                const form = new CX.chestForm('small')
                .setTitle(selection.data.itemName + ` From: ${selection.data.from.name}`)
                .addButton(5, '§cCancel', ['§6Cancel Purchase'], 'textures/blocks/glass_red');
                form.addButton(3, '§cClaim Item', ['§6Do You want to take this item?'], 'textures/blocks/glass_lime')
                .show(sender, (res) => {
                    if (res.canceled) return;
                    if (res.selection == 3) {
                        const inventory = sender.getComponent('inventory').container;
                        if (inventory.emptySlotsCount < 1) return sender.response.error('You do not have enough space to remove this item');
                        inventory.addItem(selection.item);
                        mailItems.deleteID(selection.ID)
                        sender.response.send(`You have succssfully taken the item ${selection.data.itemName}`);
                    }
                });
            }
        }
    }, 220);
}