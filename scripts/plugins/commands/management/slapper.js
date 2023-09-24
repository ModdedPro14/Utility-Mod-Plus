import { EntityTypes } from "@minecraft/server";
import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('slapper')
    .setDescription('A npc slapper command')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['create', 'edit'], true)
    .addDynamicArgument('create', [], 'create')
    .addDynamicArgument('edit', [], 'edit'),
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
    }
})