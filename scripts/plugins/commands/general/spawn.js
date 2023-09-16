import { CX } from "../../../API/CX";
import { world } from "@minecraft/server";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('spawn')
    .setDescription('Teleports you to spawn if is set')
    .setCategory('general'),
    executes(ctx) {
        ctx.execute((sender) => {
            if (sender.score.getScore('inCombat') > 0) return sender.response.error(`You are in combat, you must wait ${sender.score.getScore('inCombat')}s before using this command`);
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            if (!Databases.server.has('spawn')) return sender.response.error('There isnt any spawn set yet');
            sender.teleport(Databases.server.read('spawn').location, { dimension: world.getDimension(Databases.server.read('spawn').dimension) });
            sender.response.send('You have been teleported to spawn');
        });
    }
});
