import { CX } from "../../../API/CX";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('money')
    .setDescription(`Manage a players ${config.currency}`)
    .setCategory('management')
    .setPermissions({ admin: true })
    .firstArguments(['set', 'add', 'remove', 'reset'], true)
    .addDynamicArgument('set', [], 'set', 'player')
    .addDynamicArgument('add', [], 'add', 'player')
    .addDynamicArgument('remove', [], 'remove', 'player')
    .addDynamicArgument('reset', [], 'reset', 'plr')
    .addPlayerArgument('player', [], true, 'amount', { self: true }, false)
    .addPlayerArgument('plr', [{ name: 'reset', type: 'dyn'}], true, null, { self: true })
    .addNumberArgument('amount', [{ name: '<set | add | remove>', type: 'dyn'}, { name: 'player', type: 'player'}]),
    executes(ctx) {
        ctx.executeArgument('set', (sender, _, args) => {
            const player = args[0];
            if (args[1] > 2111111111) return sender.response.error('The amount you enter exceded the limit');
            player.score.setScore(config.currency, args[1]);
            sender.response.send(`You have set the player §6${player.name}'s §c${config.currency} to §6${CX.extra.parseNumber(args[1])}`);
            player.response.send(`Your ${config.currency} have been set to §6${CX.extra.parseNumber(args[1])}§c by §6${sender.name}`);
        });
        ctx.executeArgument('add', (sender, _, args) => {
            const player = args[0];
            if (args[1] <= 0) return sender.response.error('The amount cant be less than one');
            if (args[1] > 2111111111) return sender.response.error('The amount you enter exceded the limit');
            player.score.addScore(config.currency, args[1]);
            sender.response.send(`You have added §6${CX.extra.parseNumber(args[1])} §cto the player §6${player.name}'s §c${config.currency}`);
            player.response.send(`§6${sender.name} §chas added §6${CX.extra.parseNumber(args[1])}§c to your ${config.currency}`);
        });
        ctx.executeArgument('remove', (sender, _, args) => {
            const player = args[0];
            if (args[1] <= 0) return sender.response.error('The amount cant be less than one');
            if (args[1] > 2111111111) return sender.response.error('The amount you enter exceded the limit');
            player.score.removeScore(config.currency, args[1]);
            sender.response.send(`You have removed §6${CX.extra.parseNumber(args[1])} §cfrom the player §6${player.name} §c${config.currency}`);
            player.response.send(`§6${sender.name} has removed §6${CX.extra.parseNumber(args[1])}§c from your ${config.currency}`);
        });
        ctx.executeArgument('reset', (sender, _, args) => {
            const player = args[0];
            player.score.resetSore(config.currency);
            sender.response.send(`You have reset §6${player.name}'s ${config.currency}`);
            player.response.send(`§6${sender.name} §chas reset your ${config.currency}`);
        });
    }
})