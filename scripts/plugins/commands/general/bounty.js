import { CX } from "../../../API/CX";
import config, { bounties } from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('bounty')
    .setDescription('A bounty system')
    .setCategory('general')
    .firstArguments(['set'], true)
    .addDynamicArgument('set',  [], 'set', 'name')
    .addPlayerArgument('name', [], true, 'amount', { self: false })
    .addNumberArgument('amount', ['set', 'name']),
    executes(ctx) {
        ctx.executeArgument('set', (sender, _, args) => {
            if (args[1] > sender.score.getScore(config.currency)) return sender.response.error(`You do not have enough ${config.currency}`);
            if (bounties.find(k => k?.setter?.id == sender.id ? true : false)) return sender.response.error('You cannot set another bounty');
            if (bounties.find(k => k?.target?.id == args[0].id ? true : false)) return sender.response.error('That player already has a bounty set on him');
            if (args[1] == 0) return sender.response.error('The amount cant less than 1');
            if (`${args[1]}`.startsWith('-')) return sender.response.error('The amount cant less than 1');
            bounties.push({
                target: { id: args[0].id, name: args[0].name },
                setter: { id: sender.id, name: sender.name },
                amount: args[1]
            });
            sender.response.send(`Successfully set a bounty of ${CX.extra.parseNumber(args[1])} on ${args[0].name}`);
            CX.send(`§c§l${sender.name}§r§c§l Has set a bounty of ${CX.extra.parseNumber(args[1])} on ${args[0].name}`);
            sender.score.removeScore(config.currency, args[1]);
        });
    }
});
