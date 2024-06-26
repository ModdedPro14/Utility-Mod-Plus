import { EntityTypes } from "@minecraft/server";
import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('slapper')
    .setDescription('A npc slapper command')
    .setCategory('management')
    .setPermissions({ admin: true })
    .firstArguments(['create', 'edit', 'remove'], true)
    .addDynamicArgument('create', [], 'create')
    .addDynamicArgument('edit', [], 'edit')
    .addDynamicArgument('remove', [], 'remove'),
    executes(ctx) {
        ctx.executeArgument('create', (sender) => {
            sender.response.send('Close the chat within 10 secondes')
            new CX.modalForm()
            .setTitle('Create a slapper')
            .addTextField('The name of the slapper:', 'Hit me!')
            .addTextField('The texture of the slapper:', 'EX: zombie')
            .addTextField('The command to run when hit:', 'say U just hit me')
            .force(sender, (res) => {
                if (res.canceled) return
                if (!res.formValues[0]) return sender.response.error('The slapper must have a name')
                if (!res.formValues[1]) return sender.response.error('The slapper must have a texture')
                if (!EntityTypes.get(res.formValues[1])) return sender.response.error('Not a valid entity texture')
                if (!res.formValues[2]) return sender.response.error('The slapper must have a command to run')
                try {
                    const e = sender.dimension.spawnEntity(res.formValues[1], sender.location)
                    e.addTag('slapper')
                    e.addTag(`cmd:${res.formValues[2]}`)
                    e.nameTag = res.formValues[0].replaceAll('\\n', '\n')
                    sender.response.send(`Created a slapper with the name: ${res.formValues[0]}`)
                } catch {
                    sender.response.error('The slapper wasnt able to spawn due to an error or the difficulty mode')
                }
            }, 220)
        })
        ctx.executeArgument('edit', (sender) => {
            const entity = Array.from(sender.dimension.getEntities({ tags: ['slapper'], maxDistance: 2, location: sender.management.Location() }))[0];
            if (!entity) return sender.response.error('There werent a slapper close to you')
            sender.response.send('Close the chat within 10 secondes')
            new CX.actionForm()
            .setTitle('Edit Slapper')
            .addButton('Edit Info')
            .addButton('Add Command')
            .force(sender, (res) => {
                if (res.canceled) return
                if (res.selection == 0) {
                    new CX.modalForm()
                    .setTitle('Edit Info')
                    .addTextField('The name of the slapper:', entity.nameTag, entity.nameTag)
                    .show(sender, (result) => {
                        if (result.canceled) return
                        if (!result.formValues[0]) return sender.response.error('The slapper must have a name')
                        entity.nameTag = result.formValues[0]
                        sender.response.send('Successfully edited slapper')
                    })
                } else if (res.selection == 1) {
                    new CX.modalForm()
                    .setTitle('Add Command')
                    .addTextField('The command to add:', 'say why u hit me?')
                    .show(sender, (result) => {
                        if (result.canceled) return
                        if (entity.hasTag(`cmd:${result.formValues[0]}`)) return sender.response.error('The slapper already has that command')
                        entity.addTag(`cmd:${result.formValues[0]}`)
                        sender.response.send('Successfully added a command to the slapper')
                    })
                }
            }, 220)
        })
        ctx.executeArgument('remove', (sender) => {
            const entity = Array.from(sender.dimension.getEntities({ tags: ['slapper'], maxDistance: 2, location: sender.management.Location() }))[0];
            if (!entity) return sender.response.error('There werent a slapper close to you')
            entity.kill()
            sender.response.send('Successfully removed the slapper')
        })
    }
})