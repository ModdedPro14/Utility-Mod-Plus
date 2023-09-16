import { CX } from "../../../API/CX";
import { world } from "@minecraft/server";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('list')
    .setDescription('Lists players on the world')
    .setCategory('general'),
    executes(ctx) {
        ctx.execute((sender) => {
            let theText = "\n";
            for (const plr of world.getPlayers()) theText += `${plr.name}\n`;
            const amount = [...world.getPlayers()].length;
            sender.response.send(`§cThere are ${amount} players online:${theText}`, true, false);
        });
    }
});
