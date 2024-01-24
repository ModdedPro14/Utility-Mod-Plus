import { CX } from "../../../API/CX";
import { ItemDB } from "../../../API/database/IDB";
import { Databases } from "../../../API/handlers/databases";

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
            if (args[1] == sender.name) return sender.response.error('You cant send a mail to yourself')
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
    const form = new CX.chestForm('large')
    const allMails = [...mailItems.allIDs().filter((v) => v.data.to.id == sender.id), ...Databases.mails.values().filter((v) => v.to.id == sender.id)], pages = Math.ceil(allMails.length / 45)
    form.setTitle(`Your Mails Page: ${page}/${pages}`)
    if (!allMails.length) return (new CX.messageForm()
    .setTitle('No Mails Available')
    .setBody('§cHmmm.. it seems like that you have not recived any new mail yet...')
    .setButton2('§cClose')
    .setButton1('§aOk')
    .force(sender, ((_) => {}), 220))
    form.addButton(49, '§cClose', ['§6Close this page'], 'textures/blocks/barrier');
    if (page < pages) form.addButton(51, '§aNext page', ['§6Shows the next page'], 'minecraft:arrow')
    if (page > 1) form.addButton(47, '§cPrevious page', ['§6Shows the previous page'], 'minecraft:arrow')
    form.addPattren('bottom', '', [], 'textures/blocks/glass_black', [page == 1 ? undefined : 47, 49, page < pages ? 51 : undefined])
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
        if (result.selection == 51 && page < pages) mails(sender, page + 1)
        else if (result.selection == 47 && page > 1) mails(sender, page - 1)
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