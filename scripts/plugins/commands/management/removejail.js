import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('removejail')
    .setDescription('Removes the current jail location')
    .setCategory('management')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            if (!Databases.server.has('jail')) return sender.response.error('There isnt a jail set');
            Databases.server.delete('jail');
            for (const plr of world.getPlayers({ tags: [config.adminTag] })) plr.response.send(`The jail location have been removed by §6${sender.name}`);
        });
    }
})