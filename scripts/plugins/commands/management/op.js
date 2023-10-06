import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('op')
    .setDescription('Manage a players permission')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['add', 'remove'], true)
    .addDynamicArgument('add', [], 'add', 'player')
    .addDynamicArgument('remove', [], 'remove', 'player')
    .addPlayerArgument('player', [{ name: '<add | remove>', type: 'dyn'}], true, null, { self: true }),
    executes(ctx) {
        ctx.executeArgument('add', (sender, _, args) => {
            const player = args[0];
            if (player.permission.hasPermission('admin')) return sender.response.error(`§6${player.name} §cis already an admin`);
            sender.response.send(`You have set the player §6${player.name}§c an admin`);
            player.response.send('You have been set as an admin');
            player.permission.addPermission('admin');
        });
        ctx.executeArgument('remove', (sender, _, args) => {
            const player = args[0];
            if (!player.permission.hasPermission('admin')) return sender.response.error(`§6${player.name} §cis already not an admin`);
            sender.response.send(`You have removed adminstration from the player §6${player.name}`);
            player.response.send('You have been demoted from adminstration');
            player.permission.removePermission('admin');
        });
    }
})