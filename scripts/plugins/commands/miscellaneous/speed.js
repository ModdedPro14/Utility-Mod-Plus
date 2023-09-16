import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('speed')
    .setDescription('Gives you speed boost of the amount you put')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['amount'], true)
    .addNumberArgument('amount'),
    executes(ctx) {
        ctx.executeArgument('amount', (sender, val) => {
            if (val == 0) {
                sender.runCommandAsync('effect @s clear');
                sender.response.send('Your effects have been cleared');
            } else {
                if (val > 255) return sender.response.error('The amount cant be more than 255');
                sender.runCommandAsync(`effect @s speed 99999999 ${val} true`);
                sender.response.send(`You have been given speed boost with the amount of ${val}`);
            }
        });
    }
})