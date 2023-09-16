import config from "../../../config/main";
import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('removespawn')
    .setDescription('Remove the current spawn location')
    .setCategory('management')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            if (!Databases.server.has('spawn')) return sender.response.error('There isnt a spawn set');
            Databases.server.delete('spawn');
            for (const player of world.getPlayers({ tags: [config.adminTag] })) player.response.send(`The spawn location has been removed by §6${sender.name}`);
        });
    }
})