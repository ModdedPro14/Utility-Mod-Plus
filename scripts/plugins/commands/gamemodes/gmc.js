import { CX } from "../../../API/CX";
CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
        .setName('gmc')
        .setDescription('Changes your or a players gamemode to creative')
        .setCategory('gamemodes')
        .setAdmin(true)
        .firstArguments(['player'], false)
        .addPlayerArgument('player', true, null, { self: true }, false),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (!args.length) {
                if (sender.gamemode.getGamemode() == 'creative')
                    return sender.response.error('You are already in gamemode §6Creative');
                sender.runCommandAsync('gamemode c @s');
                sender.response.send(`§cYour gamemode have been set to §6Creative`);
            }
        });
        ctx.executeArgument('player', (sender, player) => {
            if (player.gamemode.getGamemode() == 'creative')
                return sender.response.error(`Player: §6${player.name}§c is already in gamemode §6Creative`);
            player.runCommandAsync('gamemode c @s');
            player.response.send(`Your gamemode have been set to §6Creative §cby §6${sender.name}`);
            sender.response.send(`Set the gamemode of the player §6${player.name} §cto §6Creative`);
        });
    }
});
