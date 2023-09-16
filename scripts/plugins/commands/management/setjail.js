import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('setjail')
    .setDescription('Set the jail location at the location your on')
    .setCategory('management')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            if (Databases.server.has('jail')) return sender.response.error('The jail is already set');
            Databases.server.write('jail', {
                location: { x: sender.location.x, y: sender.location.y, z: sender.location.z },
                dimension: sender.dimension.id
            });
            sender.response.send(`Successfuly set jail on §6${sender.location.x.toFixed(1)}§c, §6${sender.location.y.toFixed(1)}§c, §6${sender.location.z.toFixed(1)}`);
        });
    }
})