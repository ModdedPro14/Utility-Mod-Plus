import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('smite')
    .setDescription('Smite someone')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: false }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            sender.response.send(`You have smited the player: §6${player.name}`);
            player.response.send(`You have been smited by: §6${sender.name}`);
            player.runCommandAsync(`summon lightning_bolt`);
        });
    }
})