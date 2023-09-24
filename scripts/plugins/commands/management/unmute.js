import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('unmute')
    .setDescription('Unmute a player')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: false }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (!player.chat.muted) return sender.response.error(`§6${player.name} §cis already not muted`);
            sender.response.send(`§cYou have unmuted:\n§cPlayer: §6${player.name}`, true, false);
            player.response.send(`§cYou have been unmuted:\n§cBy: §6${sender.name}`, true, false);
            player.chat.unMute();
        });
    }
})