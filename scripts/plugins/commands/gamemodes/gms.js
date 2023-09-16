import { CX } from "../../../API/CX";
CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
        .setName('gms')
        .setDescription('Changes your or a players gamemode to survival')
        .setCategory('gamemodes')
        .setAdmin(true)
        .firstArguments(['player'], false)
        .addPlayerArgument('player', true, null, { self: true }, false),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (!args.length) {
                if (sender.gamemode.getGamemode() == 'survival')
                    return sender.response.error('You are already in gamemode §6Survival');
                sender.runCommandAsync('gamemode s @s');
                sender.response.send(`§cYour gamemode have been set to §6Survival`);
            }
        });
        ctx.executeArgument('player', (sender, player) => {
            if (player.gamemode.getGamemode() == 'survival')
                return sender.response.error(`Player: §6${player.name}§c is already in gamemode §6Survival`);
            player.runCommandAsync('gamemode s @s');
            player.response.send(`Your gamemode have been set to §6Survival §cby §6${sender.name}`);
            sender.response.send(`Set the gamemode of the player §6${player.name} §cto §6Survival`);
        });
    }
});
