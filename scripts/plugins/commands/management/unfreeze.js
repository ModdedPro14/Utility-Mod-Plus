import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('unfreeze')
    .setDescription('Unfreeze a player')
    .setCategory('management')
    .setPermissions({ admin: true })
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: false }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (!player.management.freezed) return sender.response.error(`§6${player.name} §cis already not freezed`);
            player.management.unfreeze();
            player.response.send(`You have been unfreezed by: §6${sender.name}`);
            sender.response.send(`Player: §6${player.name}§c has been unfreezed`);
        });
    }
})