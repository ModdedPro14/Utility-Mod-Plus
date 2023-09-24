import { CX } from "../../../API/CX";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('balance')
    .setDescription(`Provides you or a player with amount of ${config.currency} they have`)
    .setCategory('general')
    .setAliases(['bal'])
    .firstArguments(['player'], false)
    .addPlayerArgument('player', [], true, null, { self: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send(`Your balance: ${sender.score.getScore(config.currency) == undefined ? 0 : sender.score.getScore(config.currency)}`);
        });
        ctx.executeArgument('player', (sender, player) => {
            sender.response.send(`${player.name}'s §r§c§lbalance: ${player.score.getScore(config.currency) == undefined ? 0 : player.score.getScore(config.currency)}`);
        });
    }
});
