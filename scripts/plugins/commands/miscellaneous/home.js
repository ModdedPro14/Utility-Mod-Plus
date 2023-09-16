import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('home')
    .setDescription('Teleport to a home you set')
    .setCategory('miscellaneous')
    .firstArguments(['name'], true)
    .addAnyArgument('name', 1),
    executes(ctx) {
        ctx.executeArgument('name', (sender, val) => {
            if (!Databases.homes.has(`${sender.name}:${val}`)) return sender.response.error('That home dosent exist');
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            const Data = Databases.homes.read(`${sender.name}:${val}`);
            sender.teleport(Data.location, { dimension: world.getDimension(Data.dimension) });
            sender.response.send(`You have been teleported to the home: ${val}`);
        });
    }
})