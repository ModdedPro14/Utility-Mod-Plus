import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('freeze')
    .setDescription('Freezes a player')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: false }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (player.permission.hasPermission('admin')) return sender.response.error('You cant freeze a staff member');
            if (player.management.freezed) return sender.response.error(`§6${player.name} §cis already freezed`);
            player.management.freeze();
            player.response.send(`You have been freezed by:§6 ${sender.name}`);
            sender.response.send(`Player: §6${player.name}§c has been freezed`);
        });
    }
})