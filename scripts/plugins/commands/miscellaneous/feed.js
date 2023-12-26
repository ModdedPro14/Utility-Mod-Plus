import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('feed')
    .setDescription('Regain your or a players hunger')
    .setCategory('miscellaneous')
    .setPermissions({ admin: true })
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: true }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            player.runCommandAsync('effect @s saturation 2 255 true');
            sender.response.send(`You have feeded the player §6${player.name}`);
            player.response.send(`You have been feeded by §6${sender.name}`);
        });
    }
})