import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { world } from "@minecraft/server";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('admins')
    .setDescription('Provides you with a list of online admins')
    .setCategory('general'),
    executes(ctx) {
        ctx.execute((sender) => {
            let theText = "§cAdmins:\n";
            for (const player of world.getPlayers({ tags: [config.adminTag] })) theText += `${player.name}\n`;
            sender.response.send(theText, true, false);
        });
    }
});
