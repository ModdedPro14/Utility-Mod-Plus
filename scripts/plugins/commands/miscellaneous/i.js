import { CX } from "../../../API/CX";
import { ItemTypes } from "@minecraft/server";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('i')
    .setDescription('Works just like the give command')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['item'], true)
    .addAnyArgument('item', [], 1, {}, 'amount', false)
    .addNumberArgument('amount', [], 'player', {}, false)
    .addPlayerArgument('player', ['item', 'amount'], true, null, { self: true }),
    executes(ctx) {
        ctx.executeArgument('item', (sender, val, args) => {
            let amount = args[0];
            if (!amount) amount = 1;
            if (amount > 32767) return sender.response.error('The amount cant be more than 32767');
            if (args[1]) {
                args[1].runCommandAsync(`give @s ${val} ${amount}`).catch(() => {
                    sender.response.error('The item was not able to be given')
                })
                sender.response.send(`You have given §6${args[1].name}§6 ${val}§e x§6${amount}`)
                args[1].response.send(`You have been given §6${val} §ex§6${amount}`);
            } else {
                sender.runCommandAsync(`give @s ${val} ${amount}`).catch(() => {
                    sender.response.error('The item was not able to be given')
                })
                sender.response.send(`You have been given §6${val} §ex§6${amount}`);
            }
        });
    }
})