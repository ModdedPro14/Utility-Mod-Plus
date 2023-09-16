import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('jail')
    .setDescription('Jail a player')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', true, null, { self: false }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (player.permission.hasPermission('admin')) return sender.response.error('You cant jail a staff member');
            if (!Databases.server.has('jail')) return sender.response.error('There isnt a jail set');
            if (player.management.jailed) return sender.response.error(`§6${player.name} §cis already jailed`);
            player.management.jail();
            sender.response.send(`You have jailed the player §6${player.name}`);
            player.response.send('You have been jailed');
        });
    }
})