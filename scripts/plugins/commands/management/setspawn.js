import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('setspawn')
    .setDescription('Set the spawn location at the location your on')
    .setCategory('management')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            if (Databases.server.has('spawn')) return sender.response.error('The spawn is already set');
            Databases.server.write('spawn', {
                location: { x: sender.location.x, y: sender.location.y, z: sender.location.z },
                dimension: sender.dimension.id
            });
            sender.response.send(`Successfully set spawn on §6${sender.location.x.toFixed(1)}§c, §6${sender.location.y.toFixed(1)}§c, §6${sender.location.z.toFixed(1)}`);
        });
    }
})