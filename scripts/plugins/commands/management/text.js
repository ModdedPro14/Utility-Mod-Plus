import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('text')
    .setDescription('Set a floating text at your position')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['text', 'remove'], true)
    .addDynamicArgument('remove', 'remove')
    .addAnyArgument('text', 1),
    executes(ctx) {
        ctx.executeArgument('text', (sender, val) => {
            const ft = sender.dimension.spawnEntity('mod:ft', sender.location);
            ft.nameTag = val.replaceAll("\\n", "\n");
            sender.response.send(`Added a floating text at your location with the text of: ${val}`)
        });
        ctx.executeArgument('remove', (sender) => {
            let entity = Array.from(sender.dimension.getEntities({ type: 'mod:ft', excludeTags: ['ftlb'], maxDistance: 2, location: sender.management.Location() }))[0];
            if (!entity) return sender.response.error('Unable to locate any floating text within the radius of 2 blocks');
            sender.response.send('Successfully removed a floating text nearby');
            entity.runCommandAsync('kill @s');
        });
    }
})