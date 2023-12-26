import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('jaillist')
    .setDescription('Provides you a list of online jailed players')
    .setCategory('management')
    .setPermissions({ admin: true, mod: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            let jailedPlayers = "§cJailed Players:\n";
            for (const player of world.getPlayers({ tags: ["jailed"] })) jailedPlayers += `${player.name}\n`;
            sender.response.send(jailedPlayers, true, false);
        });
    }
})