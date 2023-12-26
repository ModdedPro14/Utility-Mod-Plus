import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('mutelist')
    .setDescription('Provides you a list of online muted players')
    .setCategory('management')
    .setPermissions({ admin: true, mod: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            let theText = "§cMuted Players:\n";
            for (const plr of world.getPlayers({ tags: ["mute"] })) theText += `${plr.name}\n`;
            sender.response.send(theText, true, false);
        });
    }
})