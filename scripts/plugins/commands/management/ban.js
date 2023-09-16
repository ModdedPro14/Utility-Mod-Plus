import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('ban')
    .setDescription('Ban a player from the server')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', true, 'reason', { self: false }, true)
    .addAnyArgument('reason', 1),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            if (player.permission.hasPermission('admin')) return sender.response.error('You cant ban a staff member');
            if (Databases.bans.has(player.name)) return sender.response.error(`§6${player.name} §cis already banned`);
            Databases.bans.write(player.name, {
                name: player.name,
                date: new Date().toLocaleString(),
                reason: args[0],
                by: sender.name
            });
            sender.response.send(`You have banned the player ${player.name} §cReason: ${args[0]}`);
        });
    }
})