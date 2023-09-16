import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('heal')
    .setDescription('Heal your or someones health')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', true, null, { self: true }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            player.runCommandAsync('effect @s instant_health 2 255 true');
            sender.response.send(`You have healed the player §6${player.name}`);
            player.response.send(`You have been healed by §6${sender.name}`);
        });
    }
})