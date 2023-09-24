import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('ecwipe')
    .setDescription('Wipe a players ender chest')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], false)
    .addPlayerArgument('player', [], true, null),
    executes(ctx) {
        ctx.execute((sender, args) => !args.length && sender.response.error('You must enter a player name to wipe their ender chest'));
        ctx.executeArgument('player', (sender, player) => {
            if (player.permission.hasPermission('admin')) return sender.response.error('You cant wipe a staff members ender chest');
            sender.response.send(`§6${player.name}'s §cender chest have been wiped`);
            for (let i = 0; i < 27; i++) player.runCommandAsync(`replaceitem entity @s slot.enderchest ${i} air`);
            player.response.send(`Your ender chest have been wiped by: §6${sender.name}`);
        });
    }
})