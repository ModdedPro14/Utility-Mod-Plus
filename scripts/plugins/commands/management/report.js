import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('report')
    .setDescription('Report a player')
    .setCategory('management'),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send('Close the chat within 10 secondes')
            new CX.actionForm()
            .setTitle('Report A Player')
            .setBody('Choose an option:')
            .addButton('Report A Player', 'textures/blocks/barrier.png')
            .addButton('Your Reports', 'textures/items/book_writable')
            .force(sender, (res) => {
                if (res.canceled) return
                if (res.selection == 0) {
                    const players = world.getAllPlayers().filter((plr) => plr.id !== sender.id)
                    if (!players.length) return (new CX.messageForm()
                    .setTitle('No players')
                    .setBody('§cThere are no players in the server to report!')
                    .setButton1('§aOk')
                    .setButton2('§cClose')
                    .show(sender))
                    const form = new CX.actionForm()
                    .setTitle('Report A Player')
                    .setBody('Select a player to report:')
                    players.map((plr) => form.addButton(`${plr.name}\n§r§8[§bClick to report§8]`, 'textures/steve head.png'))
                    form.show(sender, (result) => {
                        if (result.canceled) return
                        const selection = players[result.selection]
                        new CX.modalForm()
                        .setTitle(`Report ${selection.name}`)
                        .addDropDown('The reason of the report:', Databases.reportSettings.values().length ? Databases.reportSettings.values() : ['None'])
                        .addTextField('Additional Information:', 'They were...')
                        .show(sender, (ress) => {
                            if (ress.canceled) return
                            const id = CX.generateID()
                            Databases.reports.write(id, {
                                reporter: sender.name,
                                reason: Databases.reportSettings.values()[ress.formValues[0]] ?? 'None',
                                info: ress.formValues[1] ?? 'No info provided',
                                reported: selection.name,
                                id: id
                            })
                            sender.response.send(`Successfully reported the player ${selection.name} for ${Databases.reportSettings.values()[ress.formValues[0]] ?? 'No reason'}`)
                        })
                    })
                } else if (res.selection == 1) {
                    const reports = Databases.reports.values().filter((v) => v.reporter == sender.name)
                    if (!reports.length) return (new CX.messageForm()
                    .setTitle('No Reports')
                    .setBody('There are no reports that you have made!')
                    .setButton1('Ok')
                    .setButton2('Close')
                    .show(sender))
                    const form = new CX.actionForm()
                    .setTitle('Your Reports')
                    .setBody('All of the reports that you have made:')
                    reports.map((v) => form.addButton(v.reported, 'textures/steve head.png'))
                    form.show(sender, (result) => {
                        if (result.canceled) return
                        const selection = reports[result.selection]
                        new CX.messageForm()
                        .setTitle(selection.reported)
                        .setBody(`§6Reporter: §cYou\n§6Reported: §c${selection.reported}\n§6Reason: §c${selection.reason}\n§6Additional Info: §c${selection.info}\n§6Report ID: §c${selection.id}`)
                        .setButton1(`§cClose`)
                        .setButton2('§aRevoke Report')
                        .show(sender, (result) => {
                            if (result.canceled) return
                            if (result.selection == 1) {
                                Databases.reports.delete(selection.id)
                                sender.response.send('Successfully revoked report')
                            }
                        })
                    })
                }
            }, 220)
        })
    }
})