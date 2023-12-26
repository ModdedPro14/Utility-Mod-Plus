import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('drunk')
    .setDescription('Make someones screen go crazy')
    .setCategory('miscellaneous')
    .setPermissions({ admin: true })
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, 'amount', { self: true })
    .addNumberArgument('amount', [{ name: 'player', type: 'player'}]),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            const amount = args[0];
            if (amount >= 0) {
                if (player.permission.hasPermission('admin')) return sender.response.error('You cant drunk a staff member');
                if (amount > 255) return sender.response.error('The amount cant be over 255');
                if (amount == 0) {
                    sender.response.send(`You have undrunked §6${player.name}`);
                    player.runCommandAsync(`effect @s clear`);
                    player.response.send(`§6${sender.name}§c has undrunked you`);
                } else {
                    sender.response.send(`You have drunked §6${player.name}`);
                    player.runCommandAsync(`effect @s nausea 9999999 ${amount}`);
                    player.response.send(`§6${sender.name}§c has drunked you`);
                }
            }
        });
    }
})