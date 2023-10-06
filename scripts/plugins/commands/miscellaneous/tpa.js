import { CX } from "../../../API/CX";
import { playerRequests } from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('tpa')
    .setDescription('Teleport to a player')
    .setCategory('miscellaneous')
    .firstArguments(['accept', 'send', 'decline'], true)
    .addDynamicArgument('accept', [], 'accept', 'player', true)
    .addDynamicArgument('send', [], 'send', 'player')
    .addDynamicArgument('decline', [], 'decline', 'player', true)
    .addPlayerArgument('player', [{ name: '<accept | send | decline>', type: 'dyn'}], true, null, { self: false }),
    executes(ctx) {
        ctx.executeArgument('accept', (sender, _, args) => {
            if (sender.score.getScore('inCombat') > 0) return sender.response.error(`You are in combat, you must wait ${sender.score.getScore('inCombat')}s before using this command`);
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            if (!CX.player.hasTpaRequest(args[0], sender)) return sender.response.error(`§6${args[0].name}§c has not sent you a TPA request`);
            args[0].response.send(`Teleporting to §6${sender.name}'s§c location...`);
            sender.response.send(`You accepted §6${args[0].name}'s §cTPA request`);
            args[0].teleport(sender.location, { dimension: sender.dimension });
            playerRequests.splice(playerRequests.indexOf(playerRequests.find((r) => r.sender?.id === args[0]?.id && r.target?.id === sender?.id)));
        });
        ctx.executeArgument('send', (sender, _, args) => {
            if (sender.score.getScore('inCombat') > 0) return sender.response.error(`You are in combat, you must wait ${sender.score.getScore('inCombat')}s before using this command`);
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            if (CX.player.hasTpaRequest(sender, args[0])) return sender.response.error('You already sent a TPA request to this player');
            sender.response.send(`You have sent a TPA request to §6${args[0].name}`);
            args[0].response.send(`§6${sender.name}§c sent you a TPA request, type §etpa accept ${sender.name}§c to accept or §etpa decline ${sender.name}§c to decline`);
            playerRequests.push({ sender: sender, target: args[0], expires: Date.now() + 30000 });
        });
        ctx.executeArgument('decline', (sender, _, args) => {
            if (sender.score.getScore('inCombat') > 0) return sender.response.error(`You are in combat, you must wait ${sender.score.getScore('inCombat')}s before using this command`);
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            if (!CX.player.hasTpaRequest(args[0], sender)) return sender.response.error(`§6${args[0].name}§c has not sent you a TPA request`);
            args[0].response.error(`§6${sender.name}§c has declined your TPA request`);
            sender.response.send(`You declined §6${args[0].name}'s §cTPA request`);
            playerRequests.splice(playerRequests.indexOf(playerRequests.find((r) => r.sender?.id === args[0]?.id && r.target?.id === sender?.id)));
        });
    }
})