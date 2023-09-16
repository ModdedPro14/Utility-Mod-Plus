import { CX } from "../../../API/CX";
CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
        .setName('gmsp')
        .setDescription('Changes your or a players gamemode to spectator')
        .setCategory('gamemodes')
        .setAdmin(true)
        .firstArguments(['player'], false)
        .addPlayerArgument('player', true, null, { self: true }, false),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (!args.length) {
                if (sender.gamemode.getGamemode() == 'spectator')
                    return sender.response.error('You are already in gamemode §6Spectator');
                sender.runCommandAsync('gamemode spectator @s');
                sender.response.send(`§cYour gamemode have been set to §6Spectator`);
            }
        });
        ctx.executeArgument('player', (sender, player) => {
            if (player.gamemode.getGamemode() == 'spectator')
                return sender.response.error(`Player: §6${player.name}§c is already in gamemode §6Spectator`);
            player.runCommandAsync('gamemode spectator @s');
            player.response.send(`Your gamemode have been set to §6Spectator §cby §6${sender.name}`);
            sender.response.send(`Set the gamemode of the player §6${player.name} §cto §6Spectator`);
        });
    }
});
