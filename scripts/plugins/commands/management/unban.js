import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('unban')
    .setDescription('Unban a player')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addAnyArgument('player'),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (!Databases.bans.has(player.name)) return sender.response.error(`§6${player.name} §cisnt banned`);
            sender.response.send(`You have unbanned the player ${player.name}`);
            Databases.bans.delete(player.name);
        });
    }
})