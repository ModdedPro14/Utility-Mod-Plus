import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('nickname')
    .setDescription('Set the name of a player')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addPlayerArgument('player', true, 'name')
    .addAnyArgument('name', 1),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            if (!player.chat.getNicknameTag) {
                player.addTag(`nickname:${args[0]}`);
                sender.response.send(`Successfully renamed the player §6${player.name} §cto ${args[0]}`);
                player.response.send(`You have been renamed to ${args[0]}`);
            } else {
                player.removeTag(player.chat.getNicknameTag);
                player.addTag(`nickname:${args[0]}`);
                sender.response.send(`Successfully renamed the player §6${player.name} §cto ${args[0]}`);
                player.response.send(`You have been renamed to ${args[0]}`);
            }
        });
    }
})