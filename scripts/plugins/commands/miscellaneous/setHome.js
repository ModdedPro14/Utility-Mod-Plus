import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";
import { Area } from "../../../API/handlers/protect";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('setHome')
    .setDescription('Set a home')
    .setCategory('miscellaneous')
    .firstArguments(['name'], true)
    .addAnyArgument('name', 1),
    executes(ctx) {
        ctx.executeArgument('name', (sender, val) => {
            if (Databases.homes.has(`${sender.name}:${val}`)) return sender.response.error('That home already exists');
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            if (Area.as(sender, [sender.location.x, sender.location.z]).isInArea) return sender.response.error('You cannot set a home here');
            const spawn = Databases.server.read('spawn');
            if (Databases.server.has('spawn') && Array.from(sender.dimension.getEntities({ type: 'minecraft:player', location: spawn.location, maxDistance: Number(config.spawnRaduis) })).some(plr => plr.id === sender.id)) return sender.response.error(`You have to be further than ${config.spawnRaduis} blocks from spawn`);
            Databases.homes.write(`${sender.name}:${val}`, {
                name: val,
                creator: sender.name,
                location: { x: sender.location.x, y: sender.location.y, z: sender.location.z },
                dimension: sender.dimension.id
            });
            sender.response.send(`Created the home: ${val}`);
        });
    }
})