import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('unjail')
    .setDescription('Unjail a player')
    .setCategory('management')
    .setPermissions({ admin: true })
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: true }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (!client.server.has('spawn')) return sender.response.error(`There has to be a spawn set to unjail §6${player.name}`);
            if (!player.management.jailed) return sender.response.error(`§6${player.name} §cis already not jailed`);
            player.management.unjail();
            player.response.send('You have been unjailed');
            sender.response.send(`You have unjailed the player §6${player.name}`);
        });
    }
})