import { CX } from "../../../API/CX";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('pay')
    .setDescription(`Transfer an amount of ${config.currency} from your money to a player`)
    .setCategory('general')
    .firstArguments(['player'], true)
    .addPlayerArgument('player', true, 'amount', { self: true })
    .addNumberArgument('amount'),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            if (sender.score.getScore(config.currency) < args[0]) return sender.response.error(`You do not have enough ${config.currency} to transfer that amount`);
            if (args[0] > 100000) return sender.response.error('The amount cant be more than 100k');
            if (args[0] == 0) return sender.response.error('The amount cant be less than one');
            if (`${args[0]}`.startsWith('-')) return sender.response.error('The amount cant be less than 0');
            sender.score.removeScore(config.currency, args[0]);
            player.score.addScore(config.currency, args[0]);
            sender.response.send(`Successfully transfered §6${CX.extra.parseNumber(args[0])}§c to §6${player.name}`);
            player.response.send(`§6${sender.name} §cgave you ${CX.extra.parseNumber(args[0])}§c ${config.currency}`);
        });
    }
});
