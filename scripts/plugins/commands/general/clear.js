import { CX } from "../../../API/CX";
import { world } from "@minecraft/server";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('clear')
    .setDescription('Clears the chat')
    .setCategory('general')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            for (const plr of world.getPlayers()) {
                let space = '  ';
                for (let i = 0; i < 110; i++) CX.send(space.repeat(110));
                plr.response.send(`Chat has been cleared by ${sender.name}`);
            }
        });
    }
});
