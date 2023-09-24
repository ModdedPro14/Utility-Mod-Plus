import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('warn')
    .setDescription('Warn a player')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, 'reason', { self: false })
    .addAnyArgument('reason', ['player'], 1),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            sender.response.send(`§cYou have warned:\nPlayer: ${player.name}\n§cReason: ${args[0]}`, true, false);
            player.response.send(`§cYou have been warned:\nBy: ${sender.name}\n§cReason: ${args[0]}`, true, false);
        });
    }
})