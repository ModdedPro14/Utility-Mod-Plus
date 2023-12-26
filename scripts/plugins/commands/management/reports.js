import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('reports')
    .setDescription('Check all the filed reports')
    .setPermissions({ admin: true, mod: true })
    .setCategory('management'),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send('Close the chat within 10 secondes')
            const reports = Databases.reports.values()
            if (!reports.length) return (new CX.messageForm()
            .setTitle('No Reports')
            .setBody('There are no players that have been reported yet...')
            .setButton1('Ok')
            .setButton2('Close')
            .force(sender, () => {}, 220))
            const form = new CX.actionForm()
            .setTitle('Reported Players')
            .setBody('All the players that have been reported:')
            reports.map((v) => form.addButton(v.reported, 'textures/steve head.png'))
            form.force(sender, (res) => {
                if (res.canceled) return
                const selection = reports[res.selection]
                new CX.messageForm()
                .setTitle(selection.reported)
                .setBody(`§6Reporter: §c${selection.reporter}\n§6Reported: §c${selection.reported}\n§6Reason: §c${selection.reason}\n§6Additional Info: §c${selection.info}\n§6Report ID: §c${selection.id}`)
                .setButton1(`§cClose`)
                .setButton2('§aRevoke Report')
                .show(sender, (result) => {
                    if (result.canceled) return
                    if (result.selection == 1) {
                        Databases.reports.delete(selection.id)
                        sender.response.send('Successfully revoked report')
                    }
                })
            }, 220)
        })
    }
})