import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('unban')
    .setDescription('Unban a player')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addAnyArgument('player', [], 1),
    executes(ctx) {
        ctx.executeArgument('player', (sender, val) => {
            if (!Databases.bans.has(val)) return sender.response.error(`§6${val} §cisnt banned`);
            sender.response.send(`You have unbanned the player ${val}`);
            Databases.bans.delete(val);
        });
    }
})