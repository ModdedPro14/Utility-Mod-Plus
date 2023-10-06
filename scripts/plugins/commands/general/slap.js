import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('slap')
    .setDescription('Damges the player you chose with the amount you chose')
    .setCategory('general')
    .setAdmin(true)
    .firstArguments(['player'], false)
    .addPlayerArgument('player', [], true, 'amount')
    .addNumberArgument('amount', [{ name: 'player', type: 'player'}], null, { min: 0 }),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            if (player.name == sender.name) return sender.response.error('You cant slap yourself');
            if (player.permission.admin) return sender.response.error('You cant slap a staff member');
            if (player.gamemode.mode == 'creative') return sender.response.error('You cant slap a creative mode player');
            sender.response.send(`You have slaped the player: §6${player.name}`);
            player.response.send(`You have been slaped by: §6${sender.name}`);
            player.applyDamage(args[0]);
        });
    }
});
