import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('delhome')
    .setDescription('Delete a home')
    .setCategory('miscellaneous')
    .firstArguments(['name'], true)
    .addAnyArgument('name', [], 1),
    executes(ctx) {
        ctx.executeArgument('name', (sender, val) => {
            if (!Databases.homes.has(`${sender.name}:${val}`)) return sender.response.error('That home dosent exist');
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            Databases.homes.delete(`${sender.name}:${val}`);
            sender.response.send(`Deleted the home: ${val}`);
        });
    }
})