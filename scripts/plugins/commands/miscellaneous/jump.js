import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('jump')
    .setDescription('Gives you jump boost of the amount you put')
    .setCategory('miscellaneous')
    .setPermissions({ admin: true, mod: true })
    .firstArguments(['amount'], true)
    .addNumberArgument('amount'),
    executes(ctx) {
        ctx.executeArgument('amount', (sender, val) => {
            if (val == 0) {
                sender.runCommandAsync('effect @s clear');
                sender.response.send('You have cleared you effects');
            } else {
                if (val > 255) return sender.response.error('The amount cant be more than 255');
                sender.runCommandAsync(`effect @s jump_boost 99999999 ${val} true`);
                sender.response.send(`You have been given jump boost with the amount of ${val}`);
            }
        });
    }
})