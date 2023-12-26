import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('mute')
    .setDescription('Mute a player in the server')
    .setCategory('management')
    .setPermissions({ admin: true, mod: true })
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, 'reason', { self: false })
    .addAnyArgument('reason', [{ name: 'player', type: 'player'}], 1),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            if (player.permission.hasPermission('admin')) return sender.response.error('You cant mute a staff member');
            if (player.chat.muted) return sender.response.error(`§6${player.name} §cis already muted`);
            sender.response.send(`§cYou have muted:\n§cPlayer: §6${player.name}\n§cReason: §6${args[0]}`, true, false);
            player.response.send(`§cYou have been muted:\n§cBy: §6${sender.name}\n§cReason: §6${args[0]}`, true, false);
            player.chat.mute();
        });
    }
})