import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('nightvision')
    .setDescription('Give nightvision to yourself or another player')
    .setAdmin(true)
    .setCategory('miscellaneous')
    .setAliases(['nv'])
    .firstArguments(['player'], false)
    .addPlayerArgument('player', [], true, null, { self: true }),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (!args.length) {
                sender.runCommandAsync('effect @s night_vision 9999999 255 true')
                sender.response.send(`§cYou have been visioned`);
            }
        });
        ctx.executeArgument('player', (sender, player, args) => {
            player.runCommandAsync('effect @s night_vision 9999999 255 true')
            player.response.send(`§cYou have been visioned by: ${sender.name}`);
            sender.response.send(`You have visioned ${player.name}`)
        });
    }
})