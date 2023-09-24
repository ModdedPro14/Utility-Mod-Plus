import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('resetnickname')
    .setDescription('Set a players name back to the original')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .setAliases(['rnn', 'resetnn'])
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, null, { self: true }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (!player.chat.getNicknameTag) return sender.response.error(`§6${player.name} §cdosent have a nickname`);
            player.removeTag(player.chat.getNicknameTag);
            sender.response.send(`Successfully reset the player §6${player.name}'s §cname`);
            player.response.send(`§6${sender.name} §chas reset your name`);
        });
    }
})